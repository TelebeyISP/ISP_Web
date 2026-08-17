
      import React from 'react';
      import ReactDOM from 'react-dom';
      import { Area } from '@evershop/evershop/components/common';
      import {HydrateAdmin} from '@evershop/evershop/components/common';
      
import e30aa464b from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/auth/pages/admin/all/AdminUser.js';
import e49456c19 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/base/pages/admin/all/FormCss.js';
import e6b9a27c6 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/base/pages/admin/all/GlobalCss.js';
import e626ab3be from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/base/pages/admin/all/Layout.js';
import e3a3880bd from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/base/pages/admin/all/Meta.js';
import e15d4b4fb from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/base/pages/admin/all/TailwindCss.js';
import e0f794687 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/catalog/pages/admin/all/CatalogMenuGroup.js';
import e33206416 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/catalog/pages/admin/all/NewProductQuickLink.js';
import e11f1cc90 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/checkout/pages/admin/all/ShippingSettingMenu.js';
import e549793a7 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/pages/admin/all/CmsMenuGroup.js';
import e7d9a04b7 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/pages/admin/all/CopyRight.js';
import e71f0b3bb from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/pages/admin/all/Logo.js';
import e21dac384 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/pages/admin/all/Navigation.js';
import e6040d805 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/pages/admin/all/Notification.js';
import e77bfda3c from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/pages/admin/all/QuickLinks.js';
import e3be79bdb from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/pages/admin/all/SearchBox.js';
import e1976c5f6 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/pages/admin/all/Survey.js';
import e15a757a6 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/pages/admin/all/Version.js';
import e47681994 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/pages/admin/cmsPageEdit+cmsPageNew/General.js';
import e56255c57 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/pages/admin/cmsPageEdit+cmsPageNew/PageHeading.js';
import e56f4bf81 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/pages/admin/cmsPageEdit+cmsPageNew/Seo.js';
import e07fd2110 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/pages/admin/cmsPageNew/PageNewForm.js';
import e0743c9d7 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/customer/pages/admin/all/CustomerMenuGroup.js';
import e4c259b8f from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/oms/pages/admin/all/OmsMenuGroup.js';
import e295d3036 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/promotion/pages/admin/all/CouponMenuGroup.js';
import e47334809 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/promotion/pages/admin/all/NewCouponQuickLink.js';
import e0539e0b2 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/setting/pages/admin/all/PaymentSettingMenu.js';
import e27991419 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/setting/pages/admin/all/SettingMenuGroup.js';
import e473cc2e9 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/setting/pages/admin/all/StoreSettingMenu.js';
import e4d0c6ece from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/tax/pages/admin/all/TaxSettingMenu.js';
import e281f9e5a from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/catalog/components/CollectionProductsSetting.js';
import e5077e91a from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/components/TextBlockSetting.js';
import e15549945 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/components/BasicMenuSetting.js';
import e5a2d2c97 from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/components/BannerSetting.js';
import e221633bd from 'file:///Users/marktplaats/Desktop/Telebey/telebey-platform/apps/telebey-web/shop/node_modules/@evershop/evershop/dist/modules/cms/components/SlideshowSetting.js';
Area.defaultProps.components = {
  header: {
    e30aa464b: {
      id: 'e30aa464b',
      sortOrder: 50,
      component: { default: e30aa464b }
    },
    e71f0b3bb: {
      id: 'e71f0b3bb',
      sortOrder: 10,
      component: { default: e71f0b3bb }
    },
    e3be79bdb: {
      id: 'e3be79bdb',
      sortOrder: 20,
      component: { default: e3be79bdb }
    }
  },
  head: {
    e49456c19: {
      id: 'e49456c19',
      sortOrder: 5,
      component: { default: e49456c19 }
    },
    e6b9a27c6: {
      id: 'e6b9a27c6',
      sortOrder: 5,
      component: { default: e6b9a27c6 }
    },
    e3a3880bd: {
      id: 'e3a3880bd',
      sortOrder: 5,
      component: { default: e3a3880bd }
    },
    e15d4b4fb: {
      id: 'e15d4b4fb',
      sortOrder: 1,
      component: { default: e15d4b4fb }
    }
  },
  body: {
    e626ab3be: {
      id: 'e626ab3be',
      sortOrder: 10,
      component: { default: e626ab3be }
    },
    e6040d805: {
      id: 'e6040d805',
      sortOrder: 10,
      component: { default: e6040d805 }
    }
  },
  adminMenu: {
    e0f794687: {
      id: 'e0f794687',
      sortOrder: 20,
      component: { default: e0f794687 }
    },
    e549793a7: {
      id: 'e549793a7',
      sortOrder: 60,
      component: { default: e549793a7 }
    },
    e77bfda3c: {
      id: 'e77bfda3c',
      sortOrder: 10,
      component: { default: e77bfda3c }
    },
    e0743c9d7: {
      id: 'e0743c9d7',
      sortOrder: 40,
      component: { default: e0743c9d7 }
    },
    e4c259b8f: {
      id: 'e4c259b8f',
      sortOrder: 30,
      component: { default: e4c259b8f }
    },
    e295d3036: {
      id: 'e295d3036',
      sortOrder: 50,
      component: { default: e295d3036 }
    },
    e27991419: {
      id: 'e27991419',
      sortOrder: 500,
      component: { default: e27991419 }
    }
  },
  quickLinks: {
    e33206416: {
      id: 'e33206416',
      sortOrder: 20,
      component: { default: e33206416 }
    },
    e47334809: {
      id: 'e47334809',
      sortOrder: 30,
      component: { default: e47334809 }
    }
  },
  settingPageMenu: {
    e11f1cc90: {
      id: 'e11f1cc90',
      sortOrder: 15,
      component: { default: e11f1cc90 }
    },
    e0539e0b2: {
      id: 'e0539e0b2',
      sortOrder: 10,
      component: { default: e0539e0b2 }
    },
    e473cc2e9: {
      id: 'e473cc2e9',
      sortOrder: 5,
      component: { default: e473cc2e9 }
    },
    e4d0c6ece: {
      id: 'e4d0c6ece',
      sortOrder: 20,
      component: { default: e4d0c6ece }
    }
  },
  footerLeft: {
    e7d9a04b7: {
      id: 'e7d9a04b7',
      sortOrder: 10,
      component: { default: e7d9a04b7 }
    },
    e15a757a6: {
      id: 'e15a757a6',
      sortOrder: 20,
      component: { default: e15a757a6 }
    }
  },
  adminNavigation: {
    e21dac384: {
      id: 'e21dac384',
      sortOrder: 10,
      component: { default: e21dac384 }
    }
  },
  content: {
    e1976c5f6: {
      id: 'e1976c5f6',
      sortOrder: 999,
      component: { default: e1976c5f6 }
    },
    e56255c57: {
      id: 'e56255c57',
      sortOrder: 5,
      component: { default: e56255c57 }
    },
    e07fd2110: {
      id: 'e07fd2110',
      sortOrder: 10,
      component: { default: e07fd2110 }
    }
  },
  wideScreen: {
    e47681994: {
      id: 'e47681994',
      sortOrder: 10,
      component: { default: e47681994 }
    },
    e56f4bf81: {
      id: 'e56f4bf81',
      sortOrder: 30,
      component: { default: e56f4bf81 }
    }
  },
  '*': {
    e281f9e5a: {
      id: 'e281f9e5a',
      sortOrder: 0,
      component: { default: e281f9e5a }
    },
    e5077e91a: {
      id: 'e5077e91a',
      sortOrder: 0,
      component: { default: e5077e91a }
    },
    e15549945: {
      id: 'e15549945',
      sortOrder: 0,
      component: { default: e15549945 }
    },
    e5a2d2c97: {
      id: 'e5a2d2c97',
      sortOrder: 0,
      component: { default: e5a2d2c97 }
    },
    e221633bd: {
      id: 'e221633bd',
      sortOrder: 0,
      component: { default: e221633bd }
    }
  }
} 
ReactDOM.hydrate(
        React.createElement(HydrateAdmin, null),
        document.getElementById('app')
      );