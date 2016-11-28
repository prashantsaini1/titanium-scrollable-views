

$.paging.left = $.args.padding;
$.paging.indexPostion  = $.args.index;

$.mainControl.backgroundColor = $.args.background_color;

$.mainControl.borderColor = $.args.border;
$.coverControl.borderColor = $.args.border;

$.paging.setPagingSelectedColor = function (_color) {
    $.mainControl.backgroundColor = _color;
};
