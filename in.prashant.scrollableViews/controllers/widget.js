var args            = $.args;
var lastPage        = 0,
    totalPages      = 0,
    currentPage     = 0,
    isRemoving      = false,     // to stop calling `onScrollAnimate` while removing the view
    pagerPadding    = 5,
    pagerStyle      = ((args.pagerStyle === undefined) || (args.pagerStyle == 1)) ? 1 : 2,      // 1 for ring type pagers, 2 for solid pagers
    opacityEffect   = ((args.backdropEffect === undefined) || (args.backdropEffect == false)) ? false : true,
    pagingEffect    = ((args.pagingEffect === undefined) || (args.pagingEffect == true)) ? true : false,
    pagingTopBottom = (args.pagingPosition === undefined) || (args.pagingPosition === "bottom") ? 'bottom' : 'top',
    pagingColor     = args.pagingColor || 'white',
    pagingBackColor = (pagerStyle == 1) ? pagingColor : (args.pagingBackColor || '#aaa'),
    defaultPadding  = parseInt(args.pagingPadding) || 7,
    pagerPosition   = 12 + defaultPadding; // default left position of animated pager control


(function constructor() {
    var views = [];

    // get children if Alloy is used, or use `views` key to get pages views
    if ((args.views !== undefined) && _.isArray(args.views)) {
        views = _.filter(args.views, function(view) {
            return view.apiName == 'Ti.UI.View';
        });

    } else if (args.children !== undefined) {
        views = _.filter(args.children, function(view) {
            return view.apiName == 'Ti.UI.View';
        });
    }

    totalPages = views.length;

    // only iOS supports clipMode to show adjacent views
    if (OS_IOS && (args.clip !== undefined) && (args.clip != false)) {
        $.SCROLLABLE_VIEW.left = $.SCROLLABLE_VIEW.right = args.clipPadding || 0;
        $.SCROLLABLE_VIEW.clipViews = false;
    }

    // set pager controls - at bottom or top
    if (pagingTopBottom === 'bottom') {
        $.scrollView.bottom = pagerPadding;
    } else {
        $.scrollView.top = pagerPadding;
    }

    // set pager controls visible or invisible
    $.scrollView.visible = pagingEffect;
    $.pagerControl.borderColor = pagingColor;

    // set properties on main container
    var props = _.pick(args, 'width', 'height', 'top', 'bottom', 'left', 'right', 'backgroundColor', 'opacity', 'cacheSize');
    $.container.applyProperties(props);

    if (totalPages > 0) {
        // set views
        $.SCROLLABLE_VIEW.views = views;

        // set lastPage to zero or defined one
        if ((args.index === undefined) || (args.index > (args.children.length - 1))) {
            currentPage = 0;

        } else {
            currentPage = parseInt(args.index) || 0;           // parse valid index of current page
            currentPage = (currentPage < 0) ? 0 : currentPage; // if index is -ve, use default 0 index
            currentPage = (currentPage > (totalPages - 1)) ? 0 : currentPage;   // if greater than total views, set to 0
        }

        $.SCROLLABLE_VIEW.currentPage = currentPage;
    }

    // create paging controls or remove pager from its parent container
    if (pagingEffect) {
        createPager(totalPages);
        $.pagerControl.left = currentPage * pagerPosition;
        $.SCROLLABLE_VIEW.addEventListener('scroll', animateControl);
    }

    // create backdrop views
    if (opacityEffect) {
        for (var i = 0; i < totalPages; ++i) {
            $.backdropViews.add(Ti.UI.createView({
                backgroundColor : (args.backdropColors == undefined) ? 'transparent' : args.backdropColors[i],
                opacity : (i <= currentPage) ? 1 : 0
            }));
        }
        $.SCROLLABLE_VIEW.addEventListener('scroll', onScrollAnimate);

    } else {
        $.SCROLLABLE_VIEW.addEventListener('scrollend', function (e) {
            if (e.source.id !== "SCROLLABLE_VIEW") { return; }
            currentPage = e.currentPage;
        });
    }

})();

function createPager(_total) {
    var totalTempPagers = $.PAGING_VIEW.children.length;
    totalTempPagers = (totalTempPagers == 0) ? true : false;

    for (var i = 0; i < _total; ++i) {
        $.PAGING_VIEW.add(Ti.UI.createView({
            width: 12,
            height: 12,
            borderRadius: 6,
            touchEnabled: false,
            left : totalTempPagers ? 0 : defaultPadding,
            borderWidth : (pagerStyle == 1) ? 1.2 : 6.5,
            borderColor : pagingBackColor
        }));

        totalTempPagers = false;
    }
}

function animateControl(e) {
    if ((totalPages <= 1) || (e.currentPageAsFloat < 0) || (e.currentPageAsFloat > (totalPages - 1))) {
        return;
    }

    $.pagerControl.left = e.currentPageAsFloat * pagerPosition;
}

function onScrollAnimate(e) {
    if (e.source.id !== "SCROLLABLE_VIEW") { return; }

    if (isRemoving) { return; }

    var cFloat = e.currentPageAsFloat;

    if ((totalPages <= 1) || (cFloat < 0) || (cFloat > $.SCROLLABLE_VIEW.views.length - 1)) {
        return;
    }

    var delta = cFloat - Math.floor(cFloat);

    // require('log')('Delta = ' + delta + ' : Float = ' + cFloat + ' : Page = ' + e.currentPage);

    if (cFloat > currentPage) {
        // on iOS, scrolling can be jumped slightly to next page when swiped very fastly
        // it gives currentPageAsFloat greater one page ahead and produces blink effect
        // so current float, while moving next, should not be greater than currentPage + 1
        // READ COMMENTS at bottom most of this file to see the above require('log') output
        if (cFloat > (currentPage + 1)) {
            return;
        }

        if (delta == 0) {
            delta = 1;
        }
        var nextPage = currentPage + 1;
        $.backdropViews.children[nextPage].opacity = delta;

    } else if (cFloat < currentPage) {
        // on iOS, scrolling can be jumped slightly to previous page slightly when swiped very fastly
        // it gives currentPageAsFloat lesser one page behind and produces blink effect
        // so current float, while moving to previous page, should not be less than (currentPage - 1)
        if (cFloat < (currentPage - 1)) {
            return;
        }

        var prevPage = !currentPage ? 0 : currentPage;
        $.backdropViews.children[prevPage].opacity = delta;
    }

    if (cFloat === e.currentPage) {
        // when the scrolling is finished
        currentPage = e.currentPage;
    }
}

function addView(_views, _backdropColors, _scrollToView) {
    // make an array of views and backdropcolors
    _views = _.isArray(_views) ? _views : [_views];

    if (_backdropColors !== undefined) {
        _backdropColors = _.isArray(_backdropColors) ? _backdropColors : [_backdropColors];
    }

    _.each(_views, function(_view, i) {
        if (_view.apiName == 'Ti.UI.View') {
            $.SCROLLABLE_VIEW.addView(_view);

            ++totalPages;

            if (pagingEffect) {
                $.scrollView.visible = true;
                createPager(1);
            }

            if (opacityEffect) {
                $.backdropViews.add(Ti.UI.createView({
                    backgroundColor : _backdropColors[i] || 'transparent',
                    opacity : 0
                }));
            }
        }
    });

    if ((_scrollToView !== undefined) && _.isBoolean(_scrollToView) && _scrollToView) {
        currentPage = totalPages - 1;

        $.SCROLLABLE_VIEW.currentPage = currentPage;

        // set opacity to 1 of all backdrop views, reverse views to set opacity of topmost view first to avoid blinking
        opacityEffect && _.each($.backdropViews.children.reverse(), function(_backView) { _backView.opacity = 1; });

        // set pager control to last page
        if (pagingEffect) { $.pagerControl.left = currentPage * pagerPosition; }
    }
}

function removeView(_viewOrIndex) {
    if (totalPages === 0) {
        Ti.API.warn('No view to remove');
        return;
    }

    var tempViewIndex = null;

    if (typeof _viewOrIndex === 'object') {
        if (_viewOrIndex.apiName !== 'Ti.UI.View') {
            Ti.API.warn('Cannot remove view. Invalid view type passed');
            return;

        } else {
            // find the index of the view to be removed
            _.each($.SCROLLABLE_VIEW.views, function (_tempView, i) {
                (_tempView === _viewOrIndex) && (tempViewIndex = i);
            });
        }

    } else if (typeof _viewOrIndex === 'number' && (_viewOrIndex !== NaN)) {
        tempViewIndex = _viewOrIndex;

    } else {
        Ti.API.warn('Cannot remove view. Pass either View or index');
        return;
    }

    if ( (tempViewIndex < 0) || tempViewIndex > (totalPages - 1) ) {
        Ti.API.warn('Index/View is not valid');
        return;
    }


    try {
        isRemoving = true;

        $.SCROLLABLE_VIEW.removeView($.SCROLLABLE_VIEW.views[tempViewIndex]);

        if ( (tempViewIndex < currentPage) || ((tempViewIndex == currentPage) && (tempViewIndex == (totalPages - 1))) ) {
            --currentPage;
            $.SCROLLABLE_VIEW.currentPage = currentPage;
        }

        --totalPages;

        // remove backdrop view and set opacity to 1 of all views till currentPage
        if (opacityEffect) {
            $.backdropViews.remove($.backdropViews.children[tempViewIndex]);
            var childs = $.backdropViews.children;
            for (var i=0; i<=currentPage; i++) { childs[i].opacity = 1; }
            childs = null;
        }

        // remove last pager, set left position of animated pager and if no views are then set it visible false
        if (pagingEffect) {
            if (totalPages == 0) {
                $.PAGING_VIEW.removeAllChildren();
                $.scrollView.visible = false;

            } else {
                $.PAGING_VIEW.remove($.PAGING_VIEW.children[totalPages - 1]);
                if (currentPage == 0) { $.PAGING_VIEW.children[0].left = 0; }
                $.pagerControl.left = currentPage * pagerPosition;
            }
        }

        isRemoving = false;

    } catch(ex) {
        isRemoving = false;
    }
}

function setPage(_index) {
    currentPage = _index;
    $.SCROLLABLE_VIEW.currentPage = currentPage;

    if (pagingEffect) {
        $.pagerControl.left = currentPage * pagerPosition;
    }

    if (opacityEffect) {
        _.each($.backdropViews.children, function (child, i) {
            childs[i].opacity = (i <= currentPage) ? 1 : 0;
        });
    }
}


// expose scrollable view pager
$.scrollableView = $.SCROLLABLE_VIEW;
$.add = addView;
$.remove = removeView;
$.currentPage = function () { return currentPage; };
$.totalPages = function () { return totalPages; };
$.setCurrentPage = setPage;




// iOS swiping fast issue
/*
 *
 1 - ******* FAST *******
 Delta = 0.208 : Float = 0.208 : Page = 0
 Delta = 0.538 : Float = 0.538 : Page = 1
 Delta = 0.745 : Float = 0.745 : Page = 1
 Delta = 0.991 : Float = 0.991 : Page = 1
 Delta = 0.033 : Float = 1.033 : Page = 1
 Delta = 0.045 : Float = 1.045 : Page = 1
 Delta = 0.005 : Float = 1.005 : Page = 1
 Delta = 0.001 : Float = 1.001 : Page = 1

 Delta = 0 : Float = 1 : Page = 1

 ******* SLOW *******
 Delta = 0.030 : Float = 0.030 : Page = 0
 Delta = 0.326 : Float = 0.326 : Page = 0
 Delta = 0.463 : Float = 0.463 : Page = 0
 Delta = 0.620 : Float = 0.620 : Page = 1
 Delta = 0.761 : Float = 0.761 : Page = 1
 Delta = 0.998 : Float = 0.998 : Page = 1
 Delta = 0 : Float = 1 : Page = 1
 */
