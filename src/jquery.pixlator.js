(function ($) {
    var defaults = {
        x: 10,
        y: 10,
    };

    $.fn.pixlatorEach = function (handler) {
        if ($.isArray(this)) {
            $.each(this, function (item) {
                $.fn.pixlatorEach.call(item, [options]);
            });
            return;
        }
        var image = $(this);
        if (!image)
            return;
        var data = image.data("pixlator");
        if (!data) return;
        if (!data.x || !data.y) return;
        for (var row = 0; row < data.x; row++) {
            for (var col = 0; col < data.y; col++) {
                var item = image.children(".pixel-col" + (col + 1) + ".pixel-row" + (row + 1));
                if (item.eq(0))
                    handler(item.eq(0), col + 1, row + 1, data.y, data.x);
            }
        }
    };
    $.fn.pixlator = function (options) {
        options = $.extend({}, defaults, options);
        var deferred = $.Deferred();
        if ($.isArray(this)) {
            var defs = [];//array for all the promises
            $.each(this, function (item) {
                defs.push($.fn.pixlator.call(item, [options]));
            });
            //when all the promises are complete resolve the main one
            $.when.call($, defs).done(function () {
                deferred.resolve();
            });

            //return main promise;
            return deferred.promise();
        }
        var element = this;
        var imageWidth, imageHeight, imagePath;
        imageWidth = imageHeight = 0;
        if (options.url) {
            var image = new Image();
            image.onload = function () {
                imageWidth = options.imageWidth || this.width;
                imageHeight = options.imageHeight || this.height;
                //now safe guard against too many pixels compared to height or width of actual image
                var pixelX = Math.min(imageWidth, options.x);
                var pixelY = Math.min(imageHeight, options.y);
                pixalteThatImage(element, imagePath, imageWidth, imageHeight, pixelX, pixelY);
                deferred.resolve();
            };
            image.src = imagePath = options.url;
        }
        return deferred.promise();


    };
    function pixalteThatImage(image, imagePath, imageWidth, imageHeight, pixelX, pixelY) {
        image.height(imageHeight).width(imageWidth);
        //add pixels using display inline
        var pixelWidth = Math.floor(imageWidth / pixelX);
        var pixelHeight = Math.floor(imageHeight / pixelY);
        for (var row = 0; row < pixelY; row++) {
            for (var col = 0; col < pixelX; col++) {
                var pixel = $("<div></div>");
                pixel.height(pixelHeight)
                    .width(pixelWidth)
                    .addClass("pixel-row" + (row + 1))
                    .addClass("pixel-col" + (col + 1))
                    .css({
                        'background-size': imageWidth + 'px ' + imageHeight + 'px',
                        'background-image': 'url(' + imagePath + ')',
                        'top': row * pixelHeight + "px",
                        'left': col * pixelWidth + 'px',
                        'position': 'absolute',
                        'background-position': (-1 * col * pixelWidth) + 'px ' + (-1 * row * pixelHeight) + 'px'
                    });
                image.append(pixel)
                    .css({ position: 'relative' });
            }
        }
        image.data("pixlator", { x: pixelX, y: pixelY });
    }
})(jQuery)