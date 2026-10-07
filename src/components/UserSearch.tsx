import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { Search, Loader2, User as UserIcon, X, ShoppingBag, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchProducts, type MedusaSearchHit } from '@/lib/medusa';
import { searchSitePages, type SitePage } from '@/lib/site-search';

interface UserResult {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  walletImage?: string;
  isPublic?: boolean;
}

export function UserSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<MedusaSearchHit[]>([]);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [people, setPeople] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setProducts([]);
      setPages([]);
      setPeople([]);
      return;
    }

    setPages(searchSitePages(searchTerm));

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      const searchLower = searchTerm.toLowerCase();

      const productRequest = searchProducts(searchTerm).catch((err) => {
        console.warn('Medusa search failed', err);
        return [] as MedusaSearchHit[];
      });

      const peopleRequest = (async () => {
        try {
          const usersRef = collection(db, 'users');
          const q = query(
            usersRef,
            where('usernameLowercase', '>=', searchLower),
            where('usernameLowercase', '<=', searchLower + '\uf8ff'),
            limit(5)
          );
          const querySnapshot = await getDocs(q);
          return querySnapshot.docs
            .map(doc => ({ id: doc.id, ...(doc.data() as Omit<UserResult, 'id'>) }))
            .filter(u => u.isPublic !== false);
        } catch (err) {
          console.warn('People search skipped', err);
          return [] as UserResult[];
        }
      })();

      const [productHits, userHits] = await Promise.all([productRequest, peopleRequest]);
      setProducts(productHits);
      setPeople(userHits);
      setIsLoading(false);
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const close = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  const hasQuery = searchTerm.length >= 2;
  const nothingFound = hasQuery && !isLoading && products.length === 0 && pages.length === 0 && people.length === 0;

  return (
    <div className="relative" ref={searchRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Search"
        className="p-2 rounded-full hover:bg-muted transition-colors group"
      >
        <Search className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-[28rem] bg-white border border-border rounded-2xl shadow-2xl p-4 z-[100] animate-in slide-in-from-top-2 duration-200">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              autoFocus
              type="text"
              placeholder="Search products and the site..."
              className="w-full h-11 bg-white border border-border rounded-xl pl-10 pr-10 focus:ring-2 focus:ring-primary/50 outline-none text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && searchTerm.trim()) {
                  navigate(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
                  close();
                }
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}

            {products.length > 0 && (
              <section>
                <p className="px-2 mb-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Shop</p>
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      navigate(`/shop?product=${encodeURIComponent(product.handle || product.id)}`);
                      close();
                    }}
                    className="flex w-full items-center gap-3 p-2 rounded-xl hover:bg-muted text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                      {product.thumbnail ? (
                        <img src={product.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <span className="text-sm font-bold">{product.title}</span>
                  </button>
                ))}
              </section>
            )}

            {pages.length > 0 && (
              <section>
                <p className="px-2 mb-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Site</p>
                {pages.map((page) => (
                  <button
                    key={`${page.href}-${page.title}`}
                    type="button"
                    onClick={() => {
                      navigate(page.href);
                      close();
                    }}
                    className="flex w-full items-center gap-3 p-2 rounded-xl hover:bg-muted text-left"
                  >
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">{page.title}</span>
                      <span className="block text-xs text-muted-foreground truncate">{page.description}</span>
                    </span>
                  </button>
                ))}
              </section>
            )}

            {people.length > 0 && (
              <section>
                <p className="px-2 mb-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">People</p>
                {people.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      navigate(`/${user.username}`);
                      close();
                    }}
                    className="flex w-full items-center gap-3 p-2 rounded-xl hover:bg-muted text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {user.walletImage ? (
                        <img src={user.walletImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">@{user.username}</span>
                      <span className="block text-xs text-muted-foreground truncate">{user.firstName} {user.lastName}</span>
                    </span>
                  </button>
                ))}
              </section>
            )}

            {nothingFound && (
              <p className="text-center py-6 text-sm text-muted-foreground">No results for "{searchTerm}"</p>
            )}
            {!hasQuery && (
              <p className="text-center py-6 text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-50">
                Products, pages, and people
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
