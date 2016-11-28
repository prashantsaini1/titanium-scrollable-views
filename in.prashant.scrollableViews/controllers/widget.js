var args = $.args;
var lastPage        = 0,
    totalPages      = 0,
    currentPage     = 0,
    pagingEffect    = (args.pagingEffect === undefined) || (args.pagingEffect == true),
    pagingStyle     = ((args.pagingStyle === undefined) || (args.pagingStyle == 0)) ? 0 : 1,    // 0 for animated pager, 1 for default static pager
    opacityEffect   = ((args.backdropEffect === undefined) || (args.backdropEffect == false)) ? false : true,
    defaultPadding  = parseInt(args.pagingPadding) || 7;

var pagingSelectedColor = args.pagingSelectedColor || 'white';
var borderColor = args.pagingBorderColor || 'white';

var pagerPosition = 14 + defaultPadding;        // default left position of animated pager control

(function constructor() {
    var views = null;
    if ( (args.views !== undefined) && _.isArray(args.views) ) {
        views = _.filter(args.views, function (view) { return view.apiName == 'Ti.UI.View'; });

    } else if (args.children !== undefined) {
        views = _.filter(args.children, function (view) { return view.apiName == 'Ti.UI.View'; });
    }

    totalPages = views.length;

    if (OS_IOS && (args.clip !== undefined) && (args.clip != false)) {
        $.SCROLLABLE_VIEW.left = $.SCROLLABLE_VIEW.right = args.clipPadding;
        $.SCROLLABLE_VIEW.clipViews = false;
    }

    $.PAGING_VIEW.visible  = (args.pagingVisible === undefined) ? true : args.pagingVisible;
    $.pagerControl.visible = (args.pagingVisible === undefined) ? true : args.pagingVisible;

    // set properties on main container
    var props = _.pick(args, 'width', 'height', 'top', 'bottom', 'left', 'right', 'backgroundColor');
    $.container.applyProperties(props);

    if (totalPages > 0) {
        // set views
        $.SCROLLABLE_VIEW.views = views;

        // set lastPage to zero or defined one
        if ((args.index === undefined) || (args.index > (args.children.length - 1))) {
            currentPage = 0;

        } else {
            currentPage = parseInt(args.index) || 0;
            currentPage = (currentPage < 0) ? 0 : currentPage;
        }

        $.SCROLLABLE_VIEW.currentPage = currentPage;

        // create paging controls
        if (pagingEffect) {
            if (pagingStyle == 0) {
                // create paging controls
                for (var i = 0; i < totalPages; ++i) {
                    $.PAGING_VIEW.add(Widget.createController('paging', {
                        index : i,
                        border : borderColor,
                        background_color : 'transparent',       // for animated pager, pass backgroundColor as transparent
                        padding : (i == 0) ? 0 : defaultPadding
                    }).getView());
                }

                $.pagerControl.borderColor = pagingSelectedColor;
                $.pagerControl.left = currentPage * pagerPosition;

                $.SCROLLABLE_VIEW.addEventListener('scroll', animateControl);

            } else {
                $.pagerContainer.remove($.pagerControl);        // remove animated pager

                for (var i = 0; i < totalPages; ++i) {
                    $.PAGING_VIEW.add(Widget.createController('paging', {
                        index : i,
                        border : borderColor,
                        background_color : (i == currentPage) ? pagingSelectedColor : 'transparent',
                        padding : (i == 0) ? 0 : defaultPadding
                    }).getView());
                }

                $.SCROLLABLE_VIEW.addEventListener('scrollend', setControl);
            }

        } else {
            $.pagerContainer.remove($.pagerControl);        // remove animated pager
        }

        if (opacityEffect) {
            // create backdrop views
            for (var i = 0; i < totalPages; ++i) {
                $.backdropViews.add(Ti.UI.createView({
                    backgroundColor : (args.backdropColors == undefined) ? 'transparent' :  args.backdropColors[i],
                    opacity : (i <= currentPage) ? 1 : 0
                }));
            }
            $.SCROLLABLE_VIEW.addEventListener('scroll', onScrollAnimate);
        }
    }
})();

function animateControl(e) {
    if ( (totalPages <= 1) || (e.currentPageAsFloat < 0) || (e.currentPageAsFloat > $.SCROLLABLE_VIEW.views.length - 1) ) {
        return;
    }

    $.pagerControl.left = e.currentPageAsFloat * pagerPosition;
}

function onScrollAnimate(e) {
    var cFloat = e.currentPageAsFloat;

    if ( (totalPages <= 1) || (cFloat < 0) || (cFloat > $.SCROLLABLE_VIEW.views.length - 1) ) {
        return;
    }

    var delta = cFloat - Math.floor(cFloat);

    if (cFloat > currentPage) {
        if (delta == 0) { delta = 1; }
        var nextPage = currentPage + 1;
        $.backdropViews.children[nextPage].opacity = delta;

    } else if (cFloat < currentPage) {
        // first page index must be 0
        var prevPage = !currentPage ? 0 : currentPage;
        if (delta == 1) {delta = 0;}
        $.backdropViews.children[prevPage].opacity = delta;
    }

    if (cFloat === e.currentPage) {
        // when the scrolling is finished
        currentPage = e.currentPage;
    }
}

function setControl(e) {
    _.each($.PAGING_VIEW.children, function(child, index) {
        child.setPagingSelectedColor(($.SCROLLABLE_VIEW.currentPage === index) ? pagingSelectedColor : 'transparent');
    });
}

function addView(view) {
   $.SCROLLABLE_VIEW.addView(view);
   totalPages = $.SCROLLABLE_VIEW.views.length;

   if (pagingEffect) {
       $.PAGING_VIEW.add(Widget.createController('paging', {
           border : borderColor,
           background_color : pagingStyle == 1 || totalPages == 1) ? pagingSelectedColor : 'transparent',
           padding : (totalPages == 1) ? 0 : defaultPadding
       }).getView());
   }

   $.SCROLLABLE_VIEW.currentPage = totalPages - 1;
}

function removeView(_view) {
   if (totalPages === 0) {
      Ti.API.warn('No view to remove');
      return;
   }

   if (_view.apiName !== 'Ti.UI.View') {
      Ti.API.warn('Cannot remove view. Invalid view type passed');
      return;
   }

   $.SCROLLABLE_VIEW.removeView(_view);
   totalPages = $.SCROLLABLE_VIEW.views.length;

   if (totalPages === 1) {
      $.SCROLLABLE_VIEW.currentPage = 0;
   }

   if (pagingEffect) {
       if (totalPages == 0) {
           $.PAGING_VIEW.removeAllChildren();

       } else {
           var pageIndex = totalPages - 1;
           $.PAGING_VIEW.remove($.PAGING_VIEW.children[pageIndex]);
           Ti.API.info('Pagin = ' + pageIndex);
           setControl();
       }
   }
}


// expose scrollable view pager
$.scrollableView = $.SCROLLABLE_VIEW;
$.add = addView;
$.remove = removeView;
