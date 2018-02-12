/*
 Version: 1.0.0
 Author: lemehovskiy
 Website: http://lemehovskiy.github.io
 Repo: https://github.com/lemehovskiy/parallax_background
 */

'use strict';

(function ($) {

    class ParallaxBackground {

        constructor(element, options) {

            let self = this;

            //extend by function call
            self.settings = $.extend(true, {

                event: 'scroll',
                animation_type: 'shift',
                zoom: 20,
                rotate_perspective: 1400,
                animate_duration: 1

            }, options);

            self.$element = $(element);

            //extend by data options
            self.data_options = self.$element.data('parallax-background');
            self.settings = $.extend(true, self.settings, self.data_options);


            self.init();
        }

        init() {

            let self = this;

            if (typeof TweenLite === 'undefined') {
                console.warn('TweenMax or TweenLite library is required... https://greensock.com/tweenlite');
                return;
            }

            if (typeof CSSPlugin === 'undefined') {
                console.warn('CSSPlugin in required... https://greensock.com/CSSPlugin');
                return;
            }

            let ww = 0,
                wh = 0,
                deviceOrientation = '',
                viewport_top = 0,
                viewport_bottom = 0;


            $(window).on('load resize', function () {
                ww = window.innerWidth;
                wh = window.innerHeight;

                if (ww > wh) {
                    deviceOrientation = 'landscape'
                }

                else {
                    deviceOrientation = 'portrait'
                }

            });


            if (self.settings.event == 'scroll') {
                $(window).on('load scroll', function () {

                    viewport_top = $(window).scrollTop();
                    viewport_bottom = viewport_top + wh;

                });
            }


            let animateDuration = self.settings.animate_duration,
                zoom = self.settings.zoom,
                $thisSection = self.$element,
                $thisInner = $thisSection.find('.parallax-inner'),

                innerSize = zoom + 100,
                coef = innerSize / 100,

                shift = zoom / 2 / coef,

                lastGamma = 0,
                lastBeta = 0,
                rangeGamma = 0,
                rangeBeta = 0;

            $thisSection.css({
                'overflow': 'hidden'
            });


            $thisInner.css({
                'top': -zoom / 2 + '%',
                'left': -zoom / 2 + '%',
                'height': innerSize + '%',
                'width': innerSize + '%',
                'position': 'absolute'

            });


            if (self.settings.animation_type == 'rotate') {
                TweenLite.set($thisSection, {perspective: self.settings.rotate_perspective});
                TweenLite.set($thisInner, {transformStyle: "preserve-3d"});
            }


            if (self.settings.event == 'scroll') {

                let section_offset_top = 0,
                    section_offset_bottom = 0,

                    animation_progress_px = 0,

                    animation_progress_percent = 0,

                    section_height = 0,
                    animation_length = 0;


                $(window).on('load resize', function () {

                    section_height = $thisSection.outerHeight();

                    section_offset_top = $thisSection.offset().top;
                    section_offset_bottom = section_offset_top + section_height;

                    animation_length = section_height + wh;

                });


                $(window).on('scroll resize load', function () {

                    if (viewport_bottom > section_offset_top && viewport_top < section_offset_bottom) {

                        $thisSection.addClass('active');

                        animation_progress_px = viewport_bottom - section_offset_top - (animation_length / 2);

                        animation_progress_percent = animation_progress_px / (animation_length / 2);


                        if (self.settings.animation_type == 'shift') {
                            TweenLite.to($thisInner, animateDuration, {y: shift * animation_progress_percent + '%'});

                        }

                        else if (self.settings.animation_type == 'rotate') {
                            TweenLite.to($thisInner, animateDuration, {rotationX: shift * animation_progress_percent + '%'});
                        }

                    }

                    else {
                        $thisSection.removeClass('active');
                    }

                })

            }

            else if (self.settings.event == 'mouse_move') {

                window.addEventListener("deviceorientation", function (e) {

                    let roundedGamma = Math.round(e.gamma),
                        roundedBeta = Math.round(e.beta),
                        x = 0,
                        y = 0;

                    if (roundedGamma > lastGamma && rangeGamma < 15) {
                        rangeGamma++;
                    }
                    else if (roundedGamma < lastGamma && rangeGamma > -15) {
                        rangeGamma--;
                    }

                    if (roundedBeta > lastBeta && rangeBeta < 15) {
                        rangeBeta++;
                    }
                    else if (roundedBeta < lastBeta && rangeBeta > -15) {
                        rangeBeta--;
                    }

                    lastGamma = roundedGamma;
                    lastBeta = roundedBeta;

                    let gamaInPercent = (100 / 15) * rangeGamma,
                        betaInPercent = (100 / 15) * rangeBeta;


                    //TODO Organize orientation statement

                    if (deviceOrientation == 'landscape') {
                        x = shift / coef / 100 * betaInPercent;
                        y = shift / coef / 100 * gamaInPercent;
                    }

                    else {
                        x = shift / coef / 100 * gamaInPercent;
                        y = (shift / coef / 100 * betaInPercent) * -1;
                    }


                    if (self.settings.animation_type == 'shift') {
                        TweenLite.to($thisInner, animateDuration, {x: y + '%', y: x + '%'});
                    }

                    else if (self.settings.animation_type == 'rotate') {
                        TweenLite.to($thisInner, animateDuration, {rotationX: -y + '%', rotationY: -x + '%'});
                    }


                }, true);


                $thisSection.on("mousemove", function (e) {

                    let offset = $thisSection.offset(),

                        sectionWidth = $thisSection.outerWidth(),
                        sectionHeight = $thisSection.outerHeight(),

                        pageX = e.pageX - offset.left - ($thisSection.width() * 0.5),
                        pageY = e.pageY - offset.top - ($thisSection.height() * 0.5),

                        cursorPercentPositionX = pageX / sectionWidth * 2,
                        cursorPercentPositionY = pageY / sectionHeight * 2,

                        x = shift * cursorPercentPositionX,
                        y = shift * cursorPercentPositionY;


                    if (self.settings.animation_type == 'shift') {
                        TweenLite.to($thisInner, animateDuration, {x: x + '%', y: y + '%'});

                    }

                    else if (self.settings.animation_type == 'rotate') {
                        TweenLite.to($thisInner, animateDuration, {rotationX: y + '%', rotationY: -x + '%'});
                    }

                });


                $thisSection.mouseleave(function () {

                    if (self.settings.animation_type == 'shift') {

                        TweenLite.to($thisInner, animateDuration, {x: '0%', y: '0%'});
                    }

                    else if (self.settings.animation_type == 'rotate') {
                        TweenLite.to($thisInner, animateDuration, {rotationX: 0, rotationY: 0});
                    }

                });

            }

        }
    }


    $.fn.parallaxBackground = function () {
        let $this = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            length = $this.length,
            i,
            ret;
        for (i = 0; i < length; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                $this[i].parallax_background = new ParallaxBackground($this[i], opt);
            else
                ret = $this[i].parallax_background[opt].apply($this[i].parallax_background, args);
            if (typeof ret != 'undefined') return ret;
        }
        return $this;
    };

})(jQuery);