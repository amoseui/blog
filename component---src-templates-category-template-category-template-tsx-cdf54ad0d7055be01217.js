!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},t=(new e.Error).stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="789b16d2-42eb-40ac-9a83-ffd71fb1a58c",e._sentryDebugIdIdentifier="sentry-dbid-789b16d2-42eb-40ac-9a83-ffd71fb1a58c")}catch(e){}}();var _global="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};_global.SENTRY_RELEASE={id:"3a3b89af92f1b4ec36f0697c154b2b2458952e2a"},(self.webpackChunkblog=self.webpackChunkblog||[]).push([[51],{1879:function(e,t,a){a.d(t,{J:function(){return o}});var n=a(6540),l=a(8007),d="Feed-module--link--6123b";var o=e=>{let{edges:t}=e;return n.createElement("div",{className:"Feed-module--feed--a6204"},t.map((e=>{var t,a;return n.createElement("div",{className:"Feed-module--item--c7a63",key:e.node.fields.slug},n.createElement("div",{className:"Feed-module--meta--250c2"},n.createElement("time",{className:"Feed-module--time--72864",dateTime:new Date(e.node.frontmatter.date).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})},new Date(e.node.frontmatter.date).toLocaleDateString("en-US",{year:"numeric",month:"long"})),n.createElement("span",{className:"Feed-module--divider--81a18"}),n.createElement("span",{className:"Feed-module--category--59f58"},n.createElement(l.Link,{to:e.node.fields.categorySlug,className:d},e.node.frontmatter.category))),n.createElement("h2",{className:"Feed-module--title--f252f"},n.createElement(l.Link,{className:d,to:(null===(t=e.node.frontmatter)||void 0===t?void 0:t.slug)||e.node.fields.slug},e.node.frontmatter.title)),n.createElement("p",{className:"Feed-module--description--57348"},e.node.frontmatter.description),n.createElement(l.Link,{className:"Feed-module--more--51a4e",to:(null===(a=e.node.frontmatter)||void 0===a?void 0:a.slug)||e.node.fields.slug},"Read"))})))}},4930:function(e,t,a){a.d(t,{d:function(){return s}});var n=a(6540),l=a(2485),d=a.n(l),o=a(8007),r=a(9506),i="Pagination-module--disable--7e105";var s=e=>{let{prevPagePath:t,nextPagePath:a,hasNextPage:l,hasPrevPage:s}=e;const c=d()("Pagination-module--previousLink--5590d",{[i]:!s}),m=d()("Pagination-module--nextLink--532ff",{[i]:!l});return n.createElement("div",{className:"Pagination-module--pagination--d61cb"},n.createElement("div",{className:"Pagination-module--previous--4a76b"},n.createElement(o.Link,{rel:"prev",to:s?t:"/",className:c},r.B.PREV_PAGE)),n.createElement("div",{className:"Pagination-module--next--1cab8"},n.createElement(o.Link,{rel:"next",to:l?a:"/",className:m},r.B.NEXT_PAGE)))}},1345:function(e,t,a){a.r(t),a.d(t,{Head:function(){return m}});var n=a(6540),l=a(1879),d=a(261),o=a(4476),r=a(5977),i=a(4930),s=a(3186),c=a(306);const m=e=>{let{pageContext:t}=e;const{title:a,subtitle:l}=(0,c.Q6)(),{group:d,pagination:{currentPage:r}}=t,i=r>0?`${d} - Page ${r} - ${a}`:`${d} - ${a}`;return n.createElement(o.W,{title:i,description:l})};t.default=e=>{let{data:t,pageContext:a}=e;const{group:o,pagination:c}=a,{prevPagePath:m,nextPagePath:u,hasPrevPage:g,hasNextPage:f}=c,{edges:P}=t.allMarkdownRemark;return n.createElement(d.P,null,n.createElement(s.B,null),n.createElement(r.Y,{title:o},n.createElement(l.J,{edges:P}),n.createElement(i.d,{prevPagePath:m,nextPagePath:u,hasPrevPage:g,hasNextPage:f})))}}}]);
//# sourceMappingURL=component---src-templates-category-template-category-template-tsx-cdf54ad0d7055be01217.js.map