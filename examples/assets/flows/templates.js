(function(){this.templates||(this.templates={}),this.templates.test1=function(a){return Handlebars.template(function(a,b,c,d,e){c=c||a.helpers;var f="",g,h,i=this,j="function",k=c.helperMissing,l=void 0,m=this.escapeExpression;return f+='<div class="test1">',h=c.test,g=h||b.test,typeof g===j?g=g.call(b,{hash:{}}):g===l&&(g=k.call(b,"test",{hash:{}})),f+=m(g)+"</div>",f})(a)}}).call(this),function(){this.templates||(this.templates={}),this.templates.test2=function(a){return Handlebars.template(function(a,b,c,d,e){c=c||a.helpers;var f="",g,h,i=this,j="function",k=c.helperMissing,l=void 0,m=this.escapeExpression;return f+='<div class="test2">',h=c.test,g=h||b.test,typeof g===j?g=g.call(b,{hash:{}}):g===l&&(g=k.call(b,"test",{hash:{}})),f+=m(g)+"</div>",f})(a)}}.call(this),function(){Handlebars.registerPartial("partial",Handlebars.template(function(a,b,c,d,e){c=c||a.helpers;var f="",g,h,i=this,j="function",k=c.helperMissing,l=void 0,m=this.escapeExpression;return f+='<div class="partial">',h=c.partial,g=h||b.partial,typeof g===j?g=g.call(b,{hash:{}}):g===l&&(g=k.call(b,"partial",{hash:{}})),f+=m(g)+"</div>",f}))}.call(this)