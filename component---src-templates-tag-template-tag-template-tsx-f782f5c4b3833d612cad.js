!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},t=(new e.Error).stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="473824f3-8397-4086-92b9-62a77cc43cee",e._sentryDebugIdIdentifier="sentry-dbid-473824f3-8397-4086-92b9-62a77cc43cee")}catch(e){}}();var _global="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};_global.SENTRY_RELEASE={id:"3a3b89af92f1b4ec36f0697c154b2b2458952e2a"},(self.webpackChunkblog=self.webpackChunkblog||[]).push([[459],{1879:function(e,t,a){a.d(t,{J:function(){return r}});var n=a(6540),l=a(8007),o="Feed-module--link--6123b";var r=e=>{let{edges:t}=e;return n.createElement("div",{className:"Feed-module--feed--a6204"},t.map((e=>{var t,a;return n.createElement("div",{className:"Feed-module--item--c7a63",key:e.node.fields.slug},n.createElement("div",{className:"Feed-module--meta--250c2"},n.createElement("time",{className:"Feed-module--time--72864",dateTime:new Date(e.node.frontmatter.date).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})},new Date(e.node.frontmatter.date).toLocaleDateString("en-US",{year:"numeric",month:"long"})),n.createElement("span",{className:"Feed-module--divider--81a18"}),n.createElement("span",{className:"Feed-module--category--59f58"},n.createElement(l.Link,{to:e.node.fields.categorySlug,className:o},e.node.frontmatter.category))),n.createElement("h2",{className:"Feed-module--title--f252f"},n.createElement(l.Link,{className:o,to:(null===(t=e.node.frontmatter)||void 0===t?void 0:t.slug)||e.node.fields.slug},e.node.frontmatter.title)),n.createElement("p",{className:"Feed-module--description--57348"},e.node.frontmatter.description),n.createElement(l.Link,{className:"Feed-module--more--51a4e",to:(null===(a=e.node.frontmatter)||void 0===a?void 0:a.slug)||e.node.fields.slug},"Read"))})))}},4930:function(e,t,a){a.d(t,{d:function(){return s}});var n=a(6540),l=a(2485),o=a.n(l),r=a(8007),d=a(9506),i="Pagination-module--disable--7e105";var s=e=>{let{prevPagePath:t,nextPagePath:a,hasNextPage:l,hasPrevPage:s}=e;const c=o()("Pagination-module--previousLink--5590d",{[i]:!s}),m=o()("Pagination-module--nextLink--532ff",{[i]:!l});return n.createElement("div",{className:"Pagination-module--pagination--d61cb"},n.createElement("div",{className:"Pagination-module--previous--4a76b"},n.createElement(r.Link,{rel:"prev",to:s?t:"/",className:c},d.B.PREV_PAGE)),n.createElement("div",{className:"Pagination-module--next--1cab8"},n.createElement(r.Link,{rel:"next",to:l?a:"/",className:m},d.B.NEXT_PAGE)))}},1495:function(e,t,a){a.r(t),a.d(t,{Head:function(){return m}});var n=a(6540),l=a(1879),o=a(261),r=a(4476),d=a(5977),i=a(4930),s=a(3186),c=a(306);const m=e=>{let{pageContext:t}=e;const{title:a,subtitle:l}=(0,c.Q6)(),{group:o,pagination:{currentPage:d}}=t,i=d>0?`${o} - Page ${d} - ${a}`:`${o} - ${a}`;return n.createElement(r.W,{title:i,description:l})};t.default=e=>{let{data:t,pageContext:a}=e;const{group:r,pagination:c}=a,{prevPagePath:m,nextPagePath:u,hasPrevPage:g,hasNextPage:f}=c,{edges:P}=t.allMarkdownRemark;return n.createElement(o.P,null,n.createElement(s.B,null),n.createElement(d.Y,{title:r},n.createElement(l.J,{edges:P}),n.createElement(i.d,{prevPagePath:m,nextPagePath:u,hasPrevPage:g,hasNextPage:f})))}}}]);
//# sourceMappingURL=component---src-templates-tag-template-tag-template-tsx-f782f5c4b3833d612cad.js.map