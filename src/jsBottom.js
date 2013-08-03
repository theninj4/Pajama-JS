  window.pjs = {
    defineModel: mvc.model.__pjsDefine,
    defineView: mvc.view.__pjsDefine,
    element: PjsElement,
    model: mvc.model.__pjsCreate,
    view: mvc.view.__pjsCreate
  };
})(window);

