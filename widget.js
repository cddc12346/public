(function(window, document) {
    "use strict";
    var $sk_reviews_grid_holder;
    var env_urls = skGetEnvironmentUrls('google-reviews');
    var app_url = env_urls.app_url;
    var sk_app_url = env_urls.sk_app_url;
    var app_backend_url = env_urls.app_backend_url;
    var sk_api_url = env_urls.sk_api_url;
    var app_file_server_url = env_urls.app_file_server_url;
    var sk_img_url = env_urls.sk_img_url;
    var data_storage;
    var data_bio;
    var last_key = 0;
    var current_position = 0;
    var original_data;
    var additional_error_messages = [];
    var splide = null;
    var el = document.getElementsByClassName('sk-ww-google-reviews')[0];
    if (el == undefined) {
        var el = document.getElementsByClassName('dsm-ww-fb-page-reviews')[0];
        el.className = "sk-ww-google-reviews";
    }
    el.innerHTML = "<div class='first_loading_animation' style='text-align:center; width:100%;'><img src='" + app_url + "images/ripple.svg' class='loading-img' alt='Loading animation' style='width:auto !important;' /></div>";
    loadCssFile(app_url + "libs/magnific-popup/magnific-popup.css");
    loadCssFile("https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css");
    function loadCssFile(filename) {
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref)
        }
    }
    if (window.jQuery === undefined) {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js");
        if (script_tag.readyState) {
            script_tag.onreadystatechange = function() {
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    scriptLoadHandler();
                }
            }
            ;
        } else {
            script_tag.onload = scriptLoadHandler;
        }
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    } else {
        jQuery = window.jQuery;
        scriptLoadHandler();
    }
    function scriptLoadHandler() {
        loadScript(app_url + "libs/magnific-popup/jquery.magnific-popup.min.js", function() {
            loadScript(app_url + "libs/js/masonry/masonry4.2.2.min.js", function() {
                loadScript(app_url + "libs/js/moment.min.js", function() {
                    var version = jQuery.fn.jquery;
                    version = version ? parseInt(version.charAt(0)) : 4;
                    main();
                });
            });
        });
    }
    function loadScript(url, callback) {
        var scriptTag = document.createElement('script');
        scriptTag.setAttribute("type", "text/javascript");
        scriptTag.setAttribute("src", url);
        if (typeof callback !== "undefined") {
            if (scriptTag.readyState) {
                scriptTag.onreadystatechange = function() {
                    if (this.readyState === 'complete' || this.readyState === 'loaded') {
                        callback();
                    }
                }
                ;
            } else {
                scriptTag.onload = callback;
            }
        }
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptTag);
    }
    function getDsmEmbedId(sk_google_reviews) {
        var embed_id = sk_google_reviews.attr('embed-id');
        if (embed_id == undefined) {
            embed_id = sk_google_reviews.attr('data-embed-id');
        }
        return embed_id;
    }
    function getDsmSetting(sk_google_reviews, key) {
        // [hi] hardcode the key
        console.log(key);
        if (key == "show_average_rating"){
            return 0;
        }
        if (key == "layout"){       // for slider
            return 3;
        }
        if (key == "column_count"){ // for number of display
            return 4;
        }
        if (key == "autoplay"){ // for automatic swiping
            return 1;  
        }

        // if (key == "delay"){    // for automatic swiping (carousel_movement = 0)
        //     return 2;
        // }
        
        if (key == "delay"){    // for automatic swiping (carousel_movement = 1)
            return 0;
         }


        // for carousel_movement, set delay to higher
        if (key == "smooth_carousel_movement"){    // for automatic swiping
            return 1;
        }

        // if (key == "show_average_rating"){
        //     return 0;
        // }
        var result = sk_google_reviews.find("." + key).text();
        console.log(result);
        return sk_google_reviews.find("." + key).text();
    }
    function moderateData(sk_google_reviews, reviews) {
        if (getDsmSetting(sk_google_reviews, 'order_by') == 2) {
            reviews.sort(()=>Math.random() - 0.5);
        }
        return reviews;
    }
    function applyDateFormat(sk_facebook_feed, data_storage) {
        var date_format = getDsmSetting(sk_facebook_feed, 'date_format');
        var use_24_hour_clock = getDsmSetting(sk_facebook_feed, 'use_24_hour_clock');
        var timezone = getDsmSetting(sk_facebook_feed, 'timezone');
        var show_time_posted = getDsmSetting(sk_facebook_feed, 'show_time_posted');
        var format = 'MMM D, YYYY';
        if (date_format == 'M d, Y') {
            format = 'MMM D, YYYY';
        } else if (date_format == 'jS M Y') {
            format = 'Do MMM YYYY';
        } else if (date_format == 'Y M jS') {
            format = 'YYYY MMM Do';
        } else if (date_format == 'Y-m-d') {
            format = 'YYYY-MM-D';
        } else if (date_format == 'm/d/Y') {
            format = 'MM/D/YYYY';
        } else if (date_format == 'd/m/Y') {
            format = 'D/MM/YYYY';
        } else if (date_format == 'd.m.Y') {
            format = 'D.MM.YYYY';
        } else if (date_format == 'd-m-Y') {
            format = 'D-MM-YYYY';
        }
        if (use_24_hour_clock == 1 && show_time_posted == 1) {
            format = format + ' HH:mm';
        } else if (show_time_posted == 1) {
            format = format + ' hh:mm A';
        }
        jQuery.each(data_storage, function(index, value) {
            if (data_storage[index] && data_storage[index].review_date_time) {
                var date_time = data_storage[index].review_date_time;
                var formatted_date_time = date_format == "time_ago" ? moment(date_time).fromNow() : moment(date_time).format(format);
                if (timezone) {
                    formatted_date_time = date_format == "time_ago" ? moment(date_time).fromNow() : moment(date_time).format(format);
                }
                formatted_date_time = formatted_date_time.replace('a year', '1 year');
                formatted_date_time = formatted_date_time.replace('a month', '1 month');
                formatted_date_time = makeFullMonthName(formatted_date_time)
                formatted_date_time = getDayMonthTranslation(getDsmSetting(sk_facebook_feed, 'translation'), formatted_date_time);
                data_storage[index].formatted_date_time = formatted_date_time;
            }
        });
        return data_storage;
    }
    function moderationTabFeature(data, sk_facebook_reviews) {
        var preapproved_albums = getDsmSetting(sk_facebook_reviews, 'preapproved_posts');
        var excluded_albums = getDsmSetting(sk_facebook_reviews, 'excluded_posts');
        var preapproved_posts = "do_not_show_anything";
        var excluded_posts = "";
        if (getDsmSetting(sk_facebook_reviews, 'turnon_preapproval_posts') == 1) {
            preapproved_posts = preapproved_albums;
        }
        if (excluded_albums != "") {
            excluded_posts = excluded_albums;
        }
        var new_posts_list = [];
        if (data && data) {
            for (let item of data) {
                if (typeof item != 'undefined') {
                    if (getDsmSetting(sk_facebook_reviews, 'turnon_preapproval_posts') == 1) {
                        if (preapproved_posts.indexOf(item.contributor_id) != -1) {
                            new_posts_list.push(item);
                        }
                    } else {
                        if (getDsmSetting(sk_facebook_reviews, 'turnon_preapproval_posts') == 0 && excluded_posts.indexOf(item.contributor_id) != -1) {} else {
                            new_posts_list.push(item);
                        }
                    }
                }
            }
            ;
        }
        return new_posts_list;
    }
    function showByRating(data, sk_facebook_reviews) {
        var show_5_star_rating = getDsmSetting(sk_facebook_reviews, 'show_5_star_rating') == 1 ? '5' : '';
        var show_4_star_rating = getDsmSetting(sk_facebook_reviews, 'show_4_star_rating') == 1 ? '4' : '';
        var show_3_star_rating = getDsmSetting(sk_facebook_reviews, 'show_3_star_rating') == 1 ? '3' : '';
        var show_2_star_rating = getDsmSetting(sk_facebook_reviews, 'show_2_star_rating') == 1 ? '2' : '';
        var show_1_star_rating = getDsmSetting(sk_facebook_reviews, 'show_1_star_rating') == 1 ? '1' : '';
        var ratings = show_5_star_rating + show_4_star_rating + show_3_star_rating + show_2_star_rating + show_1_star_rating;
        var new_posts_list = [];
        if (data) {
            for (let item of data) {
                if (typeof item != 'undefined') {
                    if (show_5_star_rating || show_4_star_rating || show_3_star_rating || show_2_star_rating || show_1_star_rating) {
                        item.rating = item.rating && item.rating == '5/5' ? '5' : item.rating;
                        item.rating = item.rating && item.rating == '4/5' ? '4' : item.rating;
                        item.rating = item.rating && item.rating == '3/5' ? '3' : item.rating;
                        item.rating = item.rating && item.rating == '2/5' ? '2' : item.rating;
                        item.rating = item.rating && item.rating == '1/5' ? '1' : item.rating;
                        if (ratings.indexOf(item.rating) != -1) {
                            new_posts_list.push(item);
                        }
                    }
                }
            }
        }
        return new_posts_list;
    }
    function showWithTextOnly(data, sk_google_reviews) {
        var show_rating_with_text_only = getDsmSetting(sk_google_reviews, 'show_rating_with_text_only');
        var gives_text = getDsmSetting(sk_google_reviews, 'gives_text');
        var stars_rating_text = getDsmSetting(sk_google_reviews, 'stars_rating_text');
        var new_posts_list = [];
        if (data) {
            for (let item of data) {
                if (typeof item != 'undefined') {
                    if (show_rating_with_text_only == 1) {
                        if (item.review_text != "") {
                            new_posts_list.push(item);
                        }
                    } else {
                        if (item.review_text == "") {
                            item.review_text = item.reviewer_name + " " + gives_text + " " + data_bio.name + " " + item.rating + " " + stars_rating_text;
                        }
                        new_posts_list.push(item);
                    }
                }
            }
        }
        return new_posts_list;
    }
    function sortReviewsBy(data, sk_facebook_reviews) {
        var order_by = getDsmSetting(sk_facebook_reviews, 'order_by');
        var new_posts_list = [];
        if (data) {
            switch (order_by) {
            case '0':
                data.sort(function(a, b) {
                    return new Date(b.review_date_time).getTime() - new Date(a.review_date_time).getTime();
                });
                break;
            case '1':
                data.sort(function(a, b) {
                    return b.rating - a.rating;
                });
                break;
            case '2':
                data = shuffle(data);
                break;
            case '3':
                data.sort(function(a, b) {
                    return b.review_text.length - a.review_text.length;
                });
                break;
            default:
            }
            for (let item of data) {
                if (typeof item != 'undefined') {
                    new_posts_list.push(item);
                }
            }
        }
        return new_posts_list;
    }
    function shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex],array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }
    function formatNumber(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    function loadFeed(sk_google_reviews) {
        var data = original_data;
        var embed_id = getDsmEmbedId(sk_google_reviews);
        var show_load_more_button = sk_google_reviews.find('.show_load_more_button').text();
        var show_average_rating = getDsmSetting(sk_google_reviews, "show_average_rating");
        if (sk_google_reviews.find(".sk-ww-google-reviews-items").length > 0) {
            return;
        }
        var load_more_posts_text = sk_google_reviews.find('.load_more_posts_text').text();
        if (original_data.user_info && !widgetValidation(sk_google_reviews, original_data)) {
            return;
        } else if (!original_data || !original_data.bio) {
            generateSolutionMessage(sk_google_reviews, embed_id);
            return;
        } else if (data.bio && data.bio.place_id != "" && data.bio.place_id != undefined) {
            var post_items = "";
            if (data.reviews && data.reviews.length) {
                data.reviews = moderateData(sk_google_reviews, data.reviews);
            }
            data_bio = data.bio;
            data_storage = data.reviews;
            data_storage = showByRating(data.reviews, sk_google_reviews);
            data_storage = moderationTabFeature(data_storage, sk_google_reviews);
            data_storage = showWithTextOnly(data_storage, sk_google_reviews);
            data_storage = sortReviewsBy(data_storage, sk_google_reviews);
            data_storage = applyDateFormat(sk_google_reviews, data_storage);
            if (getDsmSetting(sk_google_reviews, "layout") == 3) {
                post_items += loadSliderLayout(sk_google_reviews, data_storage);
            } else {
                post_items += "<div class='' style='display:block;overflow:hidden;'>";
                post_items += "<div class=' sk-ww-google-reviews-items'>";
                post_items += "<div class='sk_reviews_grid'>";
                post_items += "<div class='sk_reviews_grid-sizer'></div>";
                if (show_average_rating == 1) {
                    post_items += getAverageRating(sk_google_reviews, data_bio)
                }
                var enable_button = false;
                last_key = parseInt(getDsmSetting(sk_google_reviews, 'post_count'));
                for (var i = 0; i < last_key; i++) {
                    if (typeof data_storage[i] != 'undefined') {
                        // this seems like the place?                        
                        post_items += "<div class='sk_reviews_grid-item '>";
                        if (data_storage[i].review_text.length < 1) {
                            var stars = "star";
                            if (data_storage[i].rating > 1) {
                                stars = "stars";
                            }
                        }
                        post_items += getFeedItem(data_storage[i], sk_google_reviews, data.bio);
                        post_items += "</div>";
                    }
                }
                if (data_storage.length > last_key) {
                    enable_button = true;
                }
                post_items += "</div>";
                post_items += "</div>";
                post_items += "<div class='sk-below-button-container'>";
                if (enable_button && show_load_more_button == 1) {
                    post_items += "<button class='sk-google-reviews-load-more-posts'>";
                    post_items += load_more_posts_text;
                    post_items += "</button>";
                }
                post_items += "</div>";
                post_items += "</div>";
                post_items += "</div>";
            }
            //post_items += skGetBranding(sk_google_reviews, data.user_info);
            sk_google_reviews.append(post_items);
            if (getDsmSetting(sk_google_reviews, 'layout') == 3) {
                sk_google_reviews.find('.swiper-slide').each(function(index, value) {
                    if (jQuery(value).text() == "") {
                        jQuery(value).remove();
                    }
                });
                skSliderLayoutSettings(sk_google_reviews);
            }
            if (data.google_data_structure_json) {
                var json_string = JSON.stringify(data.google_data_structure_json);
                function sanitizeJSON(json) {
                    return json.replace(/[\\\/\s]/g, '');
                }
                var sanitized_json_string = sanitizeJSON(json_string);
                var existing_script = jQuery('script[type="application/ld+json"]').filter(function() {
                    return sanitizeJSON(jQuery(this).text().trim()) === sanitized_json_string;
                });
                if (!existing_script.length) {
                    jQuery('head').append('<script type="application/ld+json">' + json_string + '</script>');
                }
            }
            applyCustomUi(jQuery, sk_google_reviews);
            applyMasonry();
            fixMasonry();
            if (getDsmSetting(sk_google_reviews, 'layout') == 3) {
                setTimeout(function() {
                    applyCustomUi(jQuery, sk_google_reviews);
                    applyMasonry();
                    fixMasonry();
                }, 500);
            }
            addDescriptiveTagAttributes(sk_google_reviews);
        } else {
            var sk_error_message = errorMessage();
            sk_google_reviews.find(".first_loading_animation").hide();
            sk_google_reviews.append(sk_error_message);
        }
        if (data.user_info) {
            sk_increaseView(data.user_info);
        }
    }
    function getAverageRating(sk_google_reviews, data) {
        var google_place_name = data.name;
        if (google_place_name.trim().length < 1) {
            google_place_name = getDsmSetting(sk_google_reviews, "place_name");
        }
        var post_items = "<div class='sk_reviews_grid-item sk_reviews_badge_container'>";
        post_items += "<div class='sk_reviews_grid-content badge-content' style='padding:0;'>";
        post_items += "<div class='sk_reviews_badge'>";
        post_items += "<a class='sk-google-reviews-badge-info' href='https://www.google.com/maps/search/?api=1&query=Google&query_place_id=" + data.place_id + "' target='_blank'>";
        post_items += "<div class='sk_reviews_num_icon'>";
        post_items += data.overall_star_rating;
        post_items += "<div class='rating_star_container'>"
        for (let index = 0; index < Math.round(parseFloat(data.overall_star_rating)); index++) {
            post_items += " <span class='sk_fb_stars' style='font-family: FontAwesome !important; margin-right: 0px;' aria-hidden='true'>&#xf005;</span>";
        }
        post_items += "</div>";
        post_items += "</div>";
        post_items += "<div style='width:100%;' class='sk-badge-name'>";
        post_items += "<div style='padding:5px 0;font-weight:bold;'>Google " + getDsmSetting(sk_google_reviews, "over_all_rating_text") + "</div>";
        if (getDsmSetting(sk_google_reviews, "show_feed_title") == 1) {
            post_items += "<div class='sk-google-place-name'>" + google_place_name + "</div>";
        }
        post_items += "<div style='padding:5px 0;'>";
        if (getDsmSetting(sk_google_reviews, "show_reviews_count") == 1) {
            post_items += "<div class='sk_google_review_count'>" + formatNumber(data.rating_count) + " " + getDsmSetting(sk_google_reviews, "reviews_text") + "</div>";
        }
        if (getDsmSetting(sk_google_reviews, 'show_write_review_button') == 1) {
            post_items += " <a href='https://search.google.com/local/writereview?placeid=" + data.place_id + "' target='_blank;' class='sk-google-reviews-write-review-btn'>" + getDsmSetting(sk_google_reviews, "write_a_review_text") + "</a>";
        }
        post_items += "</div>";
        post_items += "</div>";
        post_items += "</a>";
        post_items += "</div>";
        post_items += "</div>";
        post_items += "</div>";
        return post_items;
    }
    function getFeedItem(val, sk_google_reviews, bio) {
        var show_owners_response = getDsmSetting(sk_google_reviews, "show_owners_response");
        var show_image = getDsmSetting(sk_google_reviews, "show_image");
        var character_limit = getDsmSetting(sk_google_reviews, "character_limit");
        var see_more_text = getDsmSetting(sk_google_reviews, "see_more_text");
        see_more_text = !see_more_text ? "See more" : see_more_text;
        var post_items = "";
        var review_text = val.review_text;
        if (review_text && review_text.length - 1 > character_limit && character_limit != 0 && review_text.indexOf(" ", character_limit) != -1) {
            review_text = review_text.substring(0, review_text.indexOf(" ", character_limit)) + " ...";
        }
        var view_on_google = sk_google_reviews.find('.custom_google_place_link').text().length > 0 ? sk_google_reviews.find('.custom_google_place_link').text() : val.reviewer_link;
        var first_character = val.reviewer_name.charAt(0);
        if (val.reviewer_photo_link && val.reviewer_photo_link.indexOf('=') != -1) {
            var splitted_img_link = val.reviewer_photo_link.split('=');
            splitted_img_link = splitted_img_link[1];
            val.reviewer_photo_link = val.reviewer_photo_link.replace(splitted_img_link, 'w100-h100-p-rp-mo-br40');
        }
        var profile_picture = val.reviewer_photo_link == "/images/cleardot.gif" ? "<div class='sk-ww-google-reviews-profile-replacer' >" + first_character + "</div>" : "<img loading='lazy' width='50' height='50' src='" + val.reviewer_photo_link + "' alt='profile' />";
        post_items += "<div class='sk_reviews_grid-content'>";
        post_items += "<div class='sk-ww-google-reviews-content review-list'>";
        post_items += "<div class='sk-ww-google-reviews-content-container'>";
        post_items += "<div class='sk-ww-google-reviews-reviewer'>";
        post_items += "<div class='sk-reviewer-pic'>";
        post_items += "<a href='" + val.reviewer_contributor_link + "' target='_blank'>" + profile_picture + "</a>";
        post_items += "</div>";
        var margin_top = "";
        if (getDsmSetting(sk_google_reviews, "show_date") != 1) {
            margin_top = "margin-top:10px;";
        }
        post_items += "<div class='sk-reviewer-name-action' style='" + margin_top + "'>";
        post_items += "<a style='word-wrap: break-word;' href='" + val.reviewer_contributor_link + "' target='_blank'><strong>" + val.reviewer_name + "</strong></a> ";
        if (getDsmSetting(sk_google_reviews, "show_date") == 1) {
            post_items += "<div class='sk_fb_date'>";
            var translation = getDsmSetting(sk_google_reviews, 'translation');
            post_items += getDayMonthTranslation(translation, val.formatted_date_time);
            post_items += "</div>";
        }
        post_items += "</div>";
        post_items += "</div>";
        post_items += "<div class='google-reviews-item sk-ww-google-reviews-review-text' data-link='" + val.reviewer_link + "'>";
        post_items += "<div class='sk-ww-google-reviews-review-text-content'>";
        post_items += "<div class='sk_fb_stars'>";
        for (var count = 1; count <= val.rating; count++) {
            post_items += " <span style='font-family: FontAwesome !important;' aria-hidden='true'>&#xf005;</span>";
        }
        post_items += "</div>";
        post_items += "<div>";
        post_items += review_text;
        post_items += "</div>";
        if (review_text.length > character_limit && character_limit > 0)
            post_items += "<div><span>" + see_more_text + "</span></div>";
        post_items += "</div>";
        if (val.owners_response && show_owners_response == 1) {
            post_items += "<div class='sk-ww-google-reviews-owners-response-text'>";
            post_items += "<strong>" + getDsmSetting(sk_google_reviews, "response_text") + "</strong> ";
            post_items += "<p>" + val.owners_response + "</p>";
            post_items += "</div>";
        }
        var image_width = "100%";
        if (val.reviewer_images_link && val.reviewer_images_link.length == 2) {
            image_width = "49%";
        } else if (val.reviewer_images_link && val.reviewer_images_link.length >= 3) {
            image_width = "32%";
        }
        if (val.reviewer_images_link && val.reviewer_images_link.length > 0 && show_image == 1) {
            post_items += "<div class='google-reviews-item sk-ww-google-reviews-owners-response-image'>";
            val.reviewer_images_link.forEach(function(element) {
                post_items += "<img  width='" + image_width + "' height='100%' loading='lazy' src='" + element + "' class='media_link' />";
            });
            post_items += "</div>";
        }
        post_items += "</div>";
        if (getDsmSetting(sk_google_reviews, 'show_view_on_google_button') == 1) {
            post_items += "<a target='_blank' href='" + view_on_google + "' class='sk-google-review-button-more'>";
            post_items += "<img loading='lazy' width='20' height='20' style='width: 20px !important; height: 20px !important;' class='sk-google-reviews-icon' src='" + app_url + "images/google_icon.png'/> ";
            post_items += getDsmSetting(sk_google_reviews, "view_on_facebook_text");
            post_items += "</a>";
        }
        post_items += "</div>";
        post_items += "</div>";
        post_items += "<div class='white-popup mfp-hide sk-review-popup'>";
        post_items += "<div class='sk-ww-google-reviews-reviewer'>";
        post_items += "<div class='sk-reviewer-pic'>";
        post_items += "<a href='" + val.reviewer_contributor_link + "' target='_blank'>" + profile_picture + "</a>";
        post_items += "</div>";
        post_items += "<div class='sk-reviewer-name-action'>";
        post_items += "<a  style='word-wrap: break-word;' href='" + val.reviewer_contributor_link + "' target='_blank'><strong>" + val.reviewer_name + "</strong></a> ";
        post_items += "<label class='sk_review_text'>" + getDsmSetting(sk_google_reviews, "reviewed_text") + "</label> <a href='https://www.google.com/maps/search/?api=1&query=Google&query_place_id=" + bio.place_id + "' target='_blank'>" + bio.name + "</a> ";
        post_items += "<div class='sk_fb_stars'>";
        for (var count = 1; count <= val.rating; count++) {
            post_items += " <span style='font-family: FontAwesome !important;' aria-hidden='true'>&#xf005;</span>";
        }
        if (getDsmSetting(sk_google_reviews, "show_date") == 1) {
            var translation = getDsmSetting(sk_google_reviews, 'translation');
            post_items += "<a class='sk_fb_date' href='https://www.google.com/maps/contrib/" + val.contributor_id + "/place/" + val.google_place_id + "/' target='_blank'> " + getDayMonthTranslation(translation, val.formatted_date_time) + "</a> ";
        }
        post_items += "</div>";
        post_items += "</div>";
        post_items += "<hr class='sk-separator'>";
        post_items += "</div>";
        post_items += "<div class='sk-ww-google-reviews-review-text-popup'>";
        post_items += val.review_text;
        post_items += "</div>";
        if (val.owners_response && show_owners_response == 1) {
            post_items += "<div class='sk-ww-google-reviews-owners-response-text-popup'>";
            post_items += "<strong>" + getDsmSetting(sk_google_reviews, "response_text") + "</strong> ";
            post_items += "<p> " + val.owners_response + "</p>";
            post_items += "</div>";
        }
        if (val.reviewer_images_link) {
            var image_width = "100%";
            if (val.reviewer_images_link.length == 2) {
                image_width = "49%";
            } else if (val.reviewer_images_link.length >= 3) {
                image_width = "32%";
            }
            post_items += "<div class='sk-ww-google-reviews-owners-response-image'>";
            val.reviewer_images_link.forEach(function(element) {
                post_items += "<a href='" + element + "' target='_blank'><img width='" + image_width + "' height='100%' width='' loading='lazy' style='width: " + image_width + "' src='" + element + "' class='media_link' /></a>";
            });
            post_items += "</div>";
        }
        if (getDsmSetting(sk_google_reviews, 'show_view_on_google_button') == 1) {
            post_items += "<hr class='sk-separator'>";
            post_items += "<div class='sk-google-review-button-container' >";
            post_items += "<a target='_blank' href='" + view_on_google + "' class='sk-google-review-button-more'>";
            post_items += "<img loading='lazy' width='20' height='20' style='width: 20px !important; height: 20px !important;' class='sk-google-reviews-icon' src='" + app_url + "images/google_icon.png'/> <span>" + getDsmSetting(sk_google_reviews, "view_on_facebook_text") + "</span>";
            post_items += "</a>";
            post_items += "</div>";
        }
        post_items += "</div>";
        post_items += "</div>";
        return post_items;
    }
    function errorMessage() {
        var sk_error_message = "";
        sk_error_message += "<ul class='sk_error_message'>";
        sk_error_message += "<li>Our system is syncing with your Google reviews, please check back later.</li>";
        sk_error_message += "<li>It usually takes only a few minutes, but might take up to 24 hours. We appreciate your patience.</li>";
        sk_error_message += "<li>We will notify you via email once your Google reviews feed is ready.</li>";
        sk_error_message += "<li>If you think there is a problem, <a target='_blank' href='https://go.crisp.chat/chat/embed/?website_id=2e3a484e-b418-4643-8dd2-2355d8eddc6b'>chat with support here</a>. We will solve it for you.</li>";
        sk_error_message += "</ul>";
        return sk_error_message;
    }
    function requestFeedData(sk_google_reviews) {
        var embed_id = getDsmEmbedId(sk_google_reviews);
        var json_url = app_file_server_url + embed_id + ".json?nocache=" + (new Date()).getTime();
        jQuery.getJSON(json_url, function(data) {
            original_data = data;
            loadFeed(sk_google_reviews);
        }).fail(function(e) {
            generateSolutionMessage(sk_google_reviews, embed_id);
        });
    }
    function applyMasonry() {
        var sk_google_reviews = jQuery(".sk-ww-google-reviews");
        if (getDsmSetting(sk_google_reviews, "layout") != 3 && jQuery('.sk_reviews_grid').length > 0) {
            $sk_reviews_grid_holder = new Masonry('.sk_reviews_grid',{
                itemSelector: '.sk_reviews_grid-item',
                columnWidth: '.sk_reviews_grid-item',
                percentPosition: true,
                transitionDuration: 0
            });
        }
    }
    function fixMasonry() {
        setTimeout(function() {
            applyMasonry();
        }, 500);
        setTimeout(function() {
            applyMasonry();
        }, 1000);
        setTimeout(function() {
            applyMasonry();
        }, 2000);
        setTimeout(function() {
            applyMasonry();
        }, 3000);
        setTimeout(function() {
            applyMasonry();
        }, 4000);
        setTimeout(function() {
            applyMasonry();
        }, 5000);
        setTimeout(function() {
            applyMasonry();
        }, 6000);
        setTimeout(function() {
            applyMasonry();
        }, 7000);
        setTimeout(function() {
            applyMasonry();
        }, 8000);
        setTimeout(function() {
            applyMasonry();
        }, 9000);
        setTimeout(function() {
            applyMasonry();
        }, 10000);
    }
    function loadSliderLayout(sk_google_reviews, data) {
        var column_count = getColumnCount(sk_google_reviews);
        var post_items = "";
        post_items += "<div class='sk-google-all-reviews'>";
        if ((data.length > 0 || getDsmSetting(sk_google_reviews, "show_average_rating") == 1) || column_count == 1) {
            let smooth_carousel_movement = getDsmSetting(sk_google_reviews, "smooth_carousel_movement");
            if (smooth_carousel_movement && getDsmSetting(sk_google_reviews, "autoplay") == 1) {
                smooth_carousel_movement = 1;
            } else {
                smooth_carousel_movement = 0;
            }
            sk_google_reviews.find('div.smooth_carousel_movement').text(smooth_carousel_movement);
            post_items += "<div id='sk_google_reviews_slider' class='swiper-container swiper-layout-slider'>";
            var data_position = 0;
            if (smooth_carousel_movement == 1) {
                post_items += '<section class="splide" aria-label="Splide Basic HTML Example" id="sk_splide">';
                post_items += '<div class="splide__track">';
                post_items += '<ul class="splide__list">';
                for (let index = 0; index < data.length; index++) {
                    // [hi] comment average rating
                    // if (index == 0) {
                    //     post_items += '<li class="splide__slide">';
                    //     post_items += getAverageRating(sk_google_reviews, data_bio);
                    //     post_items += '</li>';
                    // }
                    post_items += '<li class="splide__slide">';
                    let val = data[index];
                    data_position++;
                    post_items += "<div class='sk_reviews_grid'>";
                    post_items += "<div class='sk_reviews_grid-sizer'></div>";
                    post_items += "<div class='sk_reviews_grid-item' data-position='" + data_position + "'>";
                    if (typeof val != 'undefined') {
                        post_items += getFeedItem(val, sk_google_reviews, data_bio);
                    }
                    post_items += "</div>";
                    post_items += "</div>";
                    post_items += '</li>';
                }
                post_items += '</ul>';
                post_items += '</div>';
                post_items += '</section>';
            } else {
                post_items += "<button type='button' class='swiper-button-next ' style='pointer-events: all;'>";
                post_items += "<i class='sk-arrow sk-arrow-right'></i>";
                post_items += "</button>";
                post_items += "<button type='button' class='swiper-button-prev' style='pointer-events: all;'>";
                post_items += "<i class='sk-arrow sk-arrow-left'></i>";
                post_items += "</button>";
                var data_slider = data;
                var pages = Math.ceil((parseInt(data_slider.length) + 1) / column_count);
                if (pages < 1) {
                    pages = 1;
                } else if (getDsmSetting(sk_google_reviews, "show_average_rating") == 1 && (column_count == 1 || column_count == 2)) {
                    pages = pages + 1;
                }
                post_items += "<div class='swiper-wrapper'>";
                for (var slide = 1; slide <= pages; slide++) {
                    post_items += "<div class='swiper-slide' >";
                    post_items += "<div class='sk_reviews_grid' >";
                    post_items += "<div class='sk_reviews_grid-sizer'></div>";
                    if (getDsmSetting(sk_google_reviews, "show_badge_at_end_item") != 1 && getDsmSetting(sk_google_reviews, "show_average_rating") == 1 && slide == 1) {
                        pages = pages % getDsmSetting(sk_google_reviews, 'column_count') == 0 ? pages + 1 : pages;
                        post_items += getAverageRating(sk_google_reviews, data_bio);
                    }
                    var slide_data = getPaginationResult(sk_google_reviews, data_slider, slide, column_count);
                    jQuery.each(slide_data, function(key, val) {
                        data_position++;
                        if (typeof val != 'undefined') {
                            post_items += "<div class='sk_reviews_grid-item' data-position='" + data_position + "'>";
                            post_items += getFeedItem(val, sk_google_reviews, data_bio);
                            post_items += "</div>";
                        }
                    });
                    if (getDsmSetting(sk_google_reviews, "show_average_rating") == 1 && slide == pages && getDsmSetting(sk_google_reviews, "show_badge_at_end_item") == 1) {
                        post_items += getAverageRating(sk_google_reviews, data_bio);
                    }
                    post_items += "</div>";
                    post_items += "</div>";
                }
                post_items += "</div>";
            }
            post_items += "</div>";
        }
        post_items += "</div>";
        return post_items;
    }
    function getColumnCount(sk_google_reviews) {
        var column_count = getDsmSetting(sk_google_reviews, 'column_count');
        column_count = parseInt(column_count);
        if (sk_google_reviews.width() < 480) {
            column_count = 1;
        } else if (sk_google_reviews.width() <= 641) {
            column_count = column_count > 2 ? 2 : column_count;
        } else if (sk_google_reviews.width() <= 760) {
            column_count = column_count > 3 ? 3 : column_count;
        }
        if (sk_google_reviews.hasClass("sk-dashboard-iframe-preview") && sk_google_reviews.width() > 760) {
            column_count = getDsmSetting(sk_google_reviews, 'column_count');
            column_count = parseInt(column_count);
        }
        return column_count;
    }
    function getPaginationResult(sk_google_reviews, user_solutions, page, column_count) {
        if (getDsmSetting(sk_google_reviews, "show_average_rating") == 1 && page == 1 && getDsmSetting(sk_google_reviews, "show_badge_at_end_item") != 1) {
            column_count = parseInt(column_count) - 1;
        }
        var start = 0;
        var end = parseInt(column_count);
        var multiplicand = page - 1;
        var return_user_solutions = [];
        if (page != 1) {
            start = multiplicand * end;
            if (getDsmSetting(sk_google_reviews, "show_average_rating") == 1 && getDsmSetting(sk_google_reviews, "show_badge_at_end_item") != 1) {
                start = start - 1;
            }
            end = start + end;
        }
        if ((end - 1) > user_solutions.length) {
            end = user_solutions.length;
        }
        for (var i = start; i < end; i++) {
            return_user_solutions.push(user_solutions[i]);
        }
        return return_user_solutions;
    }
    function skSliderLayoutSettings(sk_google_reviews) {
        var embed_id = sk_google_reviews.attr('data-embed-id');
        var loop = false;
        var speed = 500;
        var freeMode = false;
        var autoplay = false;
        if (getDsmSetting(sk_google_reviews, "smooth_carousel_movement") == 1) {
            var delay = parseInt(getDsmSetting(sk_google_reviews, "delay"));
            splide = new Splide('#sk_splide',{
                type: 'loop',
                drag: 'free',
                focus: 'center',
                perPage: 6,
                focus: 0,
                autoScroll: {
                    speed: 2,   // [hi] hardcode the carousell speed
                },
                autoStart: false,
                autoplay: false
            });
            splide.mount(window.splide.Extensions);
            sk_google_reviews.find('.sk_reviews_grid').css({
                'width': '100%',
                'transition': 'transform 0.3s ease'
            });
            sk_google_reviews.find('.sk_reviews_grid').hover(function() {
                jQuery(this).css("transform", "scale(1.03)");
            }, function() {
                jQuery(this).css("transform", "scale(1)");
            });
            sk_google_reviews.find('.splide__pagination, .splide__arrow').css('display', 'none')
            setTimeout(function() {
                var currentURL = window.location.href;
                if (currentURL.indexOf("hochseeschein") !== -1) {
                    var splide = new Splide('#sk_google_reviews_slider',{
                        type: 'loop',
                        drag: 'free',
                        perPage: 2,
                        start: 0,
                        speed: 4000,
                        autoplay: true,
                        interval: 4000,
                        pauseOnHover: false,
                    });
                    splide.mount();
                }
            }, 50);
        } 
        else {
            var delay = parseInt(getDsmSetting(sk_google_reviews, "delay"));
            if (getDsmSetting(sk_google_reviews, "autoplay") == 1) {
                var delay = delay * 1500;
                autoplay = {
                    delay: delay
                };
                loop = true;
            }
            var swiper = new Swiper('.sk-ww-google-reviews[data-embed-id="' + embed_id + '"] .swiper-layout-slider.swiper-container',{
                slidesPerView: 1,
                spaceBetween: 0,
                loop: loop,
                autoplay: autoplay,
                freeMode: freeMode,
                speed: speed,
                freeModeMomentum: false,
                navigation: {
                    nextEl: '.sk-ww-google-reviews[data-embed-id="' + embed_id + '"] .swiper-button-next',
                    prevEl: '.sk-ww-google-reviews[data-embed-id="' + embed_id + '"] .swiper-button-prev',
                },
                on: {
                    slideNextTransitionStart: function() {
                        if (jQuery(document).width() < 520) {
                            alignSwiperButtons(sk_google_reviews)
                        }
                    },
                    slidePrevTransitionStart: function() {
                        if (jQuery(document).width() < 520) {
                            alignSwiperButtons(sk_google_reviews)
                        }
                    }
                },
            });
        }
    }
    function skLayoutSliderArrowUI(sk_google_reviews) {
        var arrow_background_color = getDsmSetting(sk_google_reviews, "arrow_background_color");
        var arrow_color = getDsmSetting(sk_google_reviews, "arrow_color");
        var arrow_opacity = getDsmSetting(sk_google_reviews, "arrow_opacity");
        sk_google_reviews.find(".swiper-button-prev i,.swiper-button-next i").mouseover(function() {
            jQuery(this).css({
                "opacity": "1",
                "border-color": arrow_background_color,
            });
        }).mouseout(function() {
            jQuery(this).css({
                "border-color": arrow_color,
                "opacity": arrow_opacity
            });
        });
        sk_google_reviews.find(".swiper-button-prev i,.swiper-button-next i").css({
            "border-color": arrow_color,
            "opacity": arrow_opacity,
            "color": arrow_color
        });
        sk_google_reviews.find(".swiper-button-spinner").css({
            "color": arrow_color
        });
        var feed_h = sk_google_reviews.find('.swiper-slide-active .sk_reviews_grid').innerHeight();
        if (feed_h == null) {
            feed_h = sk_google_reviews.find('.sk_reviews_grid').innerHeight();
        }
        sk_google_reviews.find(".swiper-wrapper,.swiper-slide,.swiper-layout-slider").css({
            "height": feed_h + "px"
        });
        sk_google_reviews.css("width", "100%");
        var feed_h_2 = feed_h / 2;
        sk_google_reviews.find(".swiper-button-prev,.swiper-button-next").css({
            "top": feed_h_2 + "px"
        });
        if (jQuery(document).width() < 520) {
            alignSwiperButtons(sk_google_reviews)
        }
        applyFooterStyle(sk_google_reviews)
    }
    function alignSwiperButtons(sk_google_reviews) {
        if (isSafariBrowser()) {
            var badge = jQuery(".swiper-slide-active .sk_reviews_grid").find('.badge-content');
            var right = 3;
            var left = -14;
            sk_google_reviews.find(".swiper-button-next").attr("style", "right: " + right + "px !important");
            sk_google_reviews.find(".swiper-button-prev").attr("style", "left: -" + left + "px !important");
        }
    }
    function hidePopUp() {
        if (jQuery.magnificPopup) {
            jQuery.magnificPopup.close();
        }
    }
    function showPopUp(jQuery, content_src, clicked_element) {
        jQuery('.sk_selected_reviews').removeClass('sk_selected_reviews');
        jQuery('.prev_sk_google_review').remove();
        jQuery('.next_sk_google_review').remove();
        clicked_element.addClass('sk_selected_reviews');
        hidePopUp();
        if (typeof jQuery.magnificPopup === "undefined") {
            if (typeof initManificPopupPlugin === "undefined") {
                loadScript(app_url + "libs/magnific-popup/jquery.magnific-popup.js")
            }
            initManificPopupPlugin(jQuery);
        }
        jQuery.magnificPopup.open({
            items: {
                src: content_src
            },
            'type': 'inline',
            fixedContentPos: false,
            closeOnBgClick: true,
            callbacks: {
                open: function() {
                    jQuery('.mfp-container').css({
                        'top': 0
                    });
                    jQuery('.mfp-content').css({
                        'vertical-align': 'inherit'
                    });
                    jQuery('.mfp-content a').css({
                        'text-decoration': 'none'
                    });
                    var post_html = "";
                    if (clicked_element.prev('.sk_reviews_grid-item').length > 0 && clicked_element.prev('.sk_reviews_grid-item').find('.sk-review-popup').length > 0) {
                        post_html += "<button class='prev_sk_google_review'>";
                        post_html += "<i class='fa fa-chevron-left sk_prt_4px' aria-hidden='true'></i>";
                        post_html += "</button>";
                    }
                    if (clicked_element.next().length > 0 && clicked_element.next('.sk_reviews_grid-item').find('.sk-review-popup').length > 0) {
                        post_html += "<button class='next_sk_google_review'>";
                        post_html += "<i class='fa fa-chevron-right sk_plt_4px' aria-hidden='true'></i>";
                        post_html += "</button>";
                    }
                    jQuery('.mfp-content').find(".mfp-close").remove();
                    jQuery('.mfp-content').prepend('<button title="Close (Esc)" type="button" class="mfp-close" style="right: 0px;">Ã—</button>');
                    var left = jQuery(".mfp-content .white-popup").offset().left;
                    var outerWidth = jQuery(".mfp-content .white-popup").outerWidth();
                    var right = left + outerWidth;
                    var right = jQuery(document).width() - right;
                    jQuery(".mfp-content").find(".mfp-close").css({
                        "right": right - 20 + "px"
                    });
                    jQuery('.mfp-content').prepend(post_html);
                    jQuery('.mfp-content').find(".next_sk_google_review").css({
                        "right": right - 50 + "px"
                    });
                    jQuery('.mfp-content').find(".prev_sk_google_review").css({
                        "left": left - 50 + "px"
                    });
                    if (splide && splide.Components && splide.Components.AutoScroll) {
                        splide.Components.AutoScroll.pause()
                    }
                },
                close: function() {
                    hidePopUp();
                    if (splide && splide.Components && splide.Components.AutoScroll) {
                        splide.Components.AutoScroll.play()
                    }
                }
            }
        });
    }
    function makeResponsive(jQuery, sk_google_reviews) {
        var sk_google_reviews_width = sk_google_reviews.width();
        var grid_sizer_item = 33.33;
        var column_count = getDsmSetting(sk_google_reviews, "column_count")
        var chronical = jQuery('link[rel="canonical"]').attr('href');
        if (chronical && chronical.indexOf("healthy-pet-aurora-illinois") != -1) {
            sk_google_reviews_width = jQuery(document).width();
        }
        if (sk_google_reviews_width <= 320) {
            grid_sizer_item = 100;
        } else if (sk_google_reviews_width <= 481) {
            grid_sizer_item = 100;
        } else if (sk_google_reviews_width <= 641) {
            grid_sizer_item = 50;
            if (column_count == 1) {
                grid_sizer_item = 100;
            }
        } else if (sk_google_reviews_width <= 930) {
            if (getDsmSetting(sk_google_reviews, "column_count") == 1) {
                grid_sizer_item = 100;
            } else if (getDsmSetting(sk_google_reviews, "column_count") == 2) {
                grid_sizer_item = 50;
            } else if (getDsmSetting(sk_google_reviews, "column_count") == 4) {
                grid_sizer_item = 25;
            } else if (getDsmSetting(sk_google_reviews, "column_count") == 5) {
                grid_sizer_item = 20;
            } else if (getDsmSetting(sk_google_reviews, "column_count") == 6) {
                grid_sizer_item = 16.6;
            } else {
                grid_sizer_item = 33.33
            }
        } else {
            if (column_count == 1) {
                grid_sizer_item = 100;
            } else if (column_count == 2) {
                grid_sizer_item = 50;
            } else if (column_count == 3) {
                grid_sizer_item = 33.33;
            } else if (column_count == 4) {
                grid_sizer_item = 25;
            } else if (column_count == 5) {
                grid_sizer_item = 20;
            } else if (column_count == 6) {
                grid_sizer_item = 16.6;
            }
        }
        sk_google_reviews.find(".sk_reviews_grid-sizer,.sk_reviews_grid-item").css({
            "width": grid_sizer_item + "%"
        });
        var imgs = sk_google_reviews.find('img');
        var len = imgs.length;
        if (getDsmSetting(sk_google_reviews, 'layout') == 3) {
            setReviewsFeedHeight(sk_google_reviews, true);
            skLayoutSliderArrowUI(sk_google_reviews);
        } else if (getDsmSetting(sk_google_reviews, 'layout') == 1) {
            setReviewsFeedHeight(sk_google_reviews, true);
        }
        if (len == 0 || imgs.prop('complete')) {
            setTimeout(function() {
                if (getDsmSetting(sk_google_reviews, 'layout') == 3) {
                    skLayoutSliderArrowUI(sk_google_reviews);
                }
            }, 50);
        }
        var counter = 0;
        [].forEach.call(imgs, function(img) {
            img.addEventListener('load', function() {
                counter++;
                if (counter + 1 == len) {
                    if (getDsmSetting(sk_google_reviews, 'layout') == 3) {
                        skLayoutSliderArrowUI(sk_google_reviews);
                    } else if (getDsmSetting(sk_google_reviews, 'layout') == 1) {
                        setReviewsFeedHeight(sk_google_reviews, true);
                    }
                }
            }, false);
        });
        if (getDsmSetting(sk_google_reviews, 'layout') != 2) {
            applyFooterStyle(sk_google_reviews);
        }
    }
    function applyFooterStyle(sk_google_reviews) {
        var bottom = parseInt(getDsmSetting(sk_google_reviews, 'item_content_padding'));
        if (sk_google_reviews.width() < 480) {
            bottom = 20;
        }
        if (getDsmSetting(sk_google_reviews, 'show_view_on_google_button') == 1) {
            sk_google_reviews.find('.sk-ww-google-reviews-content-container .sk-google-review-button-more').css({
                'position': 'absolute',
                'bottom': bottom + 'px'
            });
            sk_google_reviews.find('.sk-ww-google-reviews-review-text').css({
                'margin-bottom': bottom + 'px'
            });
        }
    }
    function hoverContent(sk_google_reviews) {
        sk_google_reviews.find(".badge-content, .sk-ww-google-reviews-review-text").mouseover(function() {
            var container_height = sk_google_reviews.find(".sk-ww-google-reviews-content").height();
            if (jQuery(this).height() < container_height) {
                jQuery(this).css({
                    "overflow-y": "auto",
                    "overflow-x": "hidden"
                });
            }
        }).mouseout(function() {
            jQuery(this).css({
                "overflow-y": "hidden"
            });
        });
        sk_google_reviews.find(".sk-ww-google-reviews-review-text-content, .sk-ww-google-reviews-owners-response-image").css({
            "width": sk_google_reviews.find(".google-reviews-item").width() + "px"
        });
        sk_google_reviews.find(".sk-ww-google-reviews-owners-response-text").css({
            "width": sk_google_reviews.find(".google-reviews-item").width() + "px"
        });
        setTimeout(function() {
            sk_google_reviews.find(".sk-ww-google-reviews-review-text-content, .sk-ww-google-reviews-owners-response-image").css({
                "width": sk_google_reviews.find(".google-reviews-item").width() + "px"
            });
            sk_google_reviews.find(".sk-ww-google-reviews-owners-response-text").css({
                "width": sk_google_reviews.find(".google-reviews-item").width() + "px"
            });
        }, 1000);
    }
    function setReviewsFeedHeight(sk_google_reviews, change) {
        jQuery(document).ready(function() {
            var thisH = 0;
            var post_height = getDsmSetting(sk_google_reviews, "post_height");
            if (post_height == 0) {
                post_height = 350;
            }
            post_height = parseInt(post_height);
            sk_google_reviews.find(".sk_reviews_badge,.google-reviews-item").css({
                "height": "auto"
            });
            sk_google_reviews.find(".sk-ww-google-reviews-content").css({
                "height": "100%"
            });
            var badgeContent = sk_google_reviews.find(".sk_reviews_badge");
            var maxHeight = jQuery(badgeContent).height();
            if (post_height < maxHeight) {
                post_height = maxHeight;
            }
            var padding_ = parseInt(getDsmSetting(sk_google_reviews, "item_content_padding"));
            sk_google_reviews.find(".sk_reviews_grid-content").css({
                "height": parseInt(post_height) + (padding_) + "px"
            });
            hoverContent(sk_google_reviews);
            setTimeout(function() {
                jQuery(".sk-ww-google-reviews-content").each(function() {
                    var main_h = (post_height - (padding_ * 2)) + 10;
                    var header = jQuery(this).find('.sk-ww-google-reviews-reviewer').height();
                    var body = jQuery(this).find('.sk-ww-google-reviews-review-text').height();
                    var footer = jQuery(this).find('.sk-google-review-button-more').height();
                    var view_on_google_btn_height = sk_google_reviews.find(".sk-google-review-button-more").height();
                    footer = footer ? footer : 0;
                    var final = main_h - header - footer - 20;
                    jQuery(this).find(".badge-content, .sk-ww-google-reviews-review-text").css({
                        "height": final + "px",
                        "overflow": "hidden"
                    });
                });
            }, 1000);
        });
    }
    function applyCustomUi(jQuery, sk_google_reviews) {
        sk_google_reviews.find(".loading-img").hide();
        sk_google_reviews.find(".first_loading_animation").hide();
        sk_google_reviews.css({
            'width': '100%'
        });
        var sk_google_reviews_width = sk_google_reviews.outerWidth(true).toFixed(2);
        sk_google_reviews.css({
            'height': 'auto'
        });
        var column_count = sk_google_reviews.find('.column_count').text();
        if (sk_google_reviews_width <= 320 || sk_google_reviews_width <= 481 || sk_google_reviews_width <= 641) {
            if (column_count > 1) {
                column_count = 2;
            }
        }
        if (sk_google_reviews.hasClass("sk-dashboard-iframe-preview") && sk_google_reviews_width > 760) {
            column_count = getDsmSetting(sk_google_reviews, 'column_count');
            column_count = parseInt(column_count);
        }
        var border_size = 0;
        var background_color = "#555555";
        var space_between_images = parseFloat(sk_google_reviews.find('.space_between_images').text());
        var margin_between_images = parseFloat(parseFloat(space_between_images).toFixed(0) / 2) - parseFloat(1);
        var total_space_between_images = (parseFloat(space_between_images).toFixed(2) * parseFloat(column_count)) + parseFloat(space_between_images);
        var pic_width = (parseFloat(sk_google_reviews_width).toFixed(0) - parseFloat(total_space_between_images).toFixed(0)) / parseFloat(column_count).toFixed(0);
        sk_google_reviews.css({
            'width': '100%'
        });
        var sk_google_reviews_width = sk_google_reviews.outerWidth(true).toFixed(2);
        sk_google_reviews.css({
            'height': 'auto'
        });
        var column_count = sk_google_reviews.find('.column_count').text();
        var border_size = 0;
        var background_color = "#555555";
        var space_between_images = parseFloat(sk_google_reviews.find('.space_between_images').text());
        var margin_between_images = parseFloat(parseFloat(space_between_images).toFixed(0) / 2) - parseFloat(1);
        var total_space_between_images = (parseFloat(space_between_images).toFixed(2) * parseFloat(column_count)) + parseFloat(space_between_images);
        var pic_width = (parseFloat(sk_google_reviews_width).toFixed(0) - parseFloat(total_space_between_images).toFixed(0)) / parseFloat(column_count).toFixed(0);
        var font_family = sk_google_reviews.find('.font_family').text();
        var details_bg_color = sk_google_reviews.find('.details_bg_color').text();
        var details_link_color = sk_google_reviews.find('.details_link_color').text();
        var details_link_hover_color = sk_google_reviews.find('.details_link_hover_color').text();
        var bold_font_color = sk_google_reviews.find('.bold_font_color').text();
        var item_bg_color = sk_google_reviews.find('.item_bg_color').text();
        // [hi]
        item_bg_color="#f2f2f2"
        // alert(item_bg_color);
        var item_font_color = sk_google_reviews.find('.item_font_color').text();
        var badge_bg_color = sk_google_reviews.find('.badge_bg_color').text();
        var badge_font_color = sk_google_reviews.find('.badge_font_color').text();
        var button_bg_color = sk_google_reviews.find('.button_bg_color').text();
        var button_text_color = sk_google_reviews.find('.button_text_color').text();
        var button_hover_bg_color = sk_google_reviews.find('.button_hover_bg_color').text();
        var button_hover_text_color = sk_google_reviews.find('.button_hover_text_color').text();
        sk_google_reviews.css({
            'font-family': font_family,
            'background-color': details_bg_color,
            'width': sk_google_reviews_width
        });
        jQuery('.sk-pop-google-videos-post').css({
            'font-family': font_family
        });
        sk_google_reviews.find('.sk-ww-google-reviews-review-text-content div').css({
            'font-family': font_family
        });
        sk_google_reviews.find('.google-videos-user-root-container a, .sk-ww-google-reviews-content a').css({
            'color': details_link_color
        });
        sk_google_reviews.find(".google-videos-user-root-container a, .sk-ww-google-reviews-content a").mouseover(function() {
            jQuery(this).css({
                'color': details_link_hover_color
            });
        }).mouseout(function() {
            jQuery(this).css({
                'color': details_link_color
            });
        });
        sk_google_reviews.find('.sk-ww-google-reviews-owners-response-text strong').css({
            'color': bold_font_color
        });
        sk_google_reviews.find('.sk-ww-google-reviews-review-text, .sk-ww-google-reviews-owners-response-text, .sk-ww-google-reviews-content label').css({
            'color': item_font_color,
        });
        sk_google_reviews.find('.sk-review-popup').css({
            'color': item_font_color,
            'font-family': font_family
        });
        sk_google_reviews.find('.sk-ww-google-reviews-review-text, .sk-ww-google-reviews-owners-response-text, .sk-ww-google-reviews-reviewer').css({
            'font-size': getDsmSetting(sk_google_reviews, "details_font_size") + "px"
        });
        sk_google_reviews.find('.sk-google-reviews-badge-info').css({
            'font-size': getDsmSetting(sk_google_reviews, "title_font_size") + "px"
        });
        if (getDsmSetting(sk_google_reviews, "details_all_caps") == 1) {
            sk_google_reviews.find('.sk-google-review-button-more, .sk-review-popup, .sk-ww-google-reviews-review-text, .sk-ww-google-reviews-owners-response-text, .sk-ww-google-reviews-reviewer, .sk_reviews_badge').css({
                'text-transform': 'uppercase'
            });
        }
        if (getDsmSetting(sk_google_reviews, "title_all_caps") == 1) {
            sk_google_reviews.find('.sk-google-place-name').css({
                'text-transform': 'uppercase'
            });
        } else {
            sk_google_reviews.find('.sk-google-place-name').css({
                'text-transform': 'none'
            });
        }
        sk_google_reviews.find(".sk-google-reviews-badge-info, .sk-ww-google-reviews-content, .sk-google-reviews-badge-info, .sk-review-popup").css({
            'padding': getDsmSetting(sk_google_reviews, "item_content_padding") + "px"
        });
        sk_google_reviews.find('.sk-ww-google-reviews-owners-response-image').css({
            'padding-bottom': getDsmSetting(sk_google_reviews, "item_content_padding") + "px"
        });
        sk_google_reviews.find('.sk_reviews_num_icon').css({
            'background-color': "transparent",
            'color': badge_font_color,
        });
        sk_google_reviews.find('.sk_reviews_badge').css({
            'border-color': badge_bg_color,
        });
        var margin_bottom_sk_ig_load_more_posts = space_between_images;
        if (margin_bottom_sk_ig_load_more_posts == 0) {
            margin_bottom_sk_ig_load_more_posts = 5;
        }
        sk_google_reviews.find(".sk-google-reviews-load-more-posts").css({
            'margin-bottom': margin_bottom_sk_ig_load_more_posts + 'px'
        });
        sk_google_reviews.find(".sk-below-button-container").css({
            "display": "block",
            "overflow": "hidden",
            "margin": "0",
            "padding": "4.5px",
        });
        sk_google_reviews.find(".google-videos-user-container, .sk-google-reviews-load-more-posts, .sk-google-reviews-bottom-follow-btn").css({
            'background-color': button_bg_color,
            'border-color': button_bg_color,
            'color': button_text_color
        });
        sk_google_reviews.find(".google-videos-user-container, .sk-google-reviews-load-more-posts, .sk-google-reviews-bottom-follow-btn").mouseover(function() {
            jQuery(this).css({
                'background-color': button_hover_bg_color,
                'border-color': button_hover_bg_color,
                'color': button_hover_text_color
            });
        }).mouseout(function() {
            jQuery(this).css({
                'background-color': button_bg_color,
                'border-color': button_bg_color,
                'color': button_text_color
            });
        });
        var padding_sk_ig_bottom_btn_container = margin_between_images;
        if (padding_sk_ig_bottom_btn_container == 0) {
            padding_sk_ig_bottom_btn_container = 5;
        }
        sk_google_reviews.find(".sk-google-reviews-bottom-btn-container").css({
            'padding': padding_sk_ig_bottom_btn_container + 'px'
        });
        sk_google_reviews.find(".sk_fb_stars").css({
            'color': getDsmSetting(sk_google_reviews, "star_color")
        });
        sk_google_reviews.find(".sk_fb_stars span").css({
            'color': getDsmSetting(sk_google_reviews, "star_color")
        });
        sk_google_reviews.find('.sk_reviews_badge a').css({
            'color': getDsmSetting(sk_google_reviews, "item_font_color")
        });
        sk_google_reviews.find(".sk-google-reviews-write-review-btn").css({
            "color": getDsmSetting(sk_google_reviews, "write_a_review_button_text_color"),
            "background-color": getDsmSetting(sk_google_reviews, "write_a_review_button_background_color")
        });
        sk_google_reviews.find(".sk-google-reviews-write-review-btn").mouseover(function() {
            jQuery(this).css({
                'color': getDsmSetting(sk_google_reviews, "write_a_review_button_text_color")
            });
        }).mouseout(function() {
            jQuery(this).css({
                'color': getDsmSetting(sk_google_reviews, "write_a_review_button_text_color")
            });
        });
        sk_google_reviews.find(".sk_reviews_grid-content").css({
            'background-color': item_bg_color,
            'color': getDsmSetting(sk_google_reviews, "item_font_color"),
            'border-radius': getDsmSetting(sk_google_reviews, "item_border_radius") + "px"
        });
        sk_google_reviews.find(".sk_reviews_grid-item").css({
            'cursor': 'pointer'
        });
        makeResponsive(jQuery, sk_google_reviews);
        if (getDsmSetting(sk_google_reviews, "one_column_layout") == 1 || (getDsmSetting(sk_google_reviews, "layout") == 3 && getDsmSetting(sk_google_reviews, "smooth_carousel_movement") == 1 && getDsmSetting(sk_google_reviews, "autoplay") == 1)) {
            sk_google_reviews.find(".sk_reviews_grid-item").css({
                'width': '100%'
            });
        }
        if (getDsmSetting(sk_google_reviews, "layout") == 2 && sk_google_reviews_width < 541) {
            sk_google_reviews.find(".sk-ww-google-reviews-review-text").css({
                'overflow': 'hidden'
            });
        }
        if (getDsmSetting(sk_google_reviews, "layout") == 3) {
            skLayoutSliderArrowUI(sk_google_reviews);
        }
        sk_google_reviews.find('.badge-content').css({
            'background-color': badge_bg_color,
            'color': badge_font_color,
        });
        jQuery('.sk_powered_by a').css({
            'background-color': getDsmSetting(sk_google_reviews, "details_bg_color"),
            'color': getDsmSetting(sk_google_reviews, "item_font_color"),
            'font-size': getDsmSetting(sk_google_reviews, "details_font_size"),
        });
        sk_google_reviews.find('.sk_powered_by').css({
            'margin-bottom': space_between_images + 'px'
        });
        sk_google_reviews.css({
            'height': 'auto'
        });
        var custom_css = getDsmSetting(sk_google_reviews, "custom_css") + " .sk_branding{ display : block !important; } .sk_branding a{ display : block !important; }";
        jQuery('head').append('<style type="text/css">' + custom_css + '</style>');
        var href = window.location.href;
        if (href && (href.indexOf('sunvalley') != -1 || href.indexOf('localtesting') != -1)) {
            sk_google_reviews.closest('section').css('justify-content', 'unset');
            sk_google_reviews.closest('.content-wrapper').css('justify-content', 'unset');
            sk_google_reviews.closest('.content-wrapper').css('padding', '0');
            sk_google_reviews.closest('.content').attr('style', 'width:80% !important;margin: 0 auto !important');
        }
        apply100PercentWidth(sk_google_reviews, sk_google_reviews_width);
        applyBadgeStyle(sk_google_reviews);
        applyPopUpColors(sk_google_reviews);
        if (getDsmSetting(sk_google_reviews, "links_clickable") == 0) {
            sk_google_reviews.find('a').not('.tutorial_link, .sk-google-review-button-more').removeAttr("href");
        }
        if (jQuery(".sk-ww-google-reviews").length == 1 && jQuery(".sk-google-all-reviews").length > 1) {
            jQuery(".sk-google-all-reviews").first().remove();
        }
        sk_google_reviews.closest(".section-fit").find(".item-absolute").css({
            "width": "100%",
            "left": "0px"
        })
    }
    function applyBadgeStyle(sk_google_reviews) {
        sk_google_reviews.find('.sk_reviews_badge_container .sk-badge-name').css({
            "background-color": "transparent",
            "color": getDsmSetting(sk_google_reviews, "badge_font_color")
        });
        sk_google_reviews.find('.sk_reviews_badge_container .sk-badge-name').find("div, .sk-google-reviews-badge-info").css({
            "background-color": "transparent",
            "color": getDsmSetting(sk_google_reviews, "badge_font_color")
        });
    }
    function apply100PercentWidth(sk_google_reviews, sk_google_reviews_width) {
        var grid_item = sk_google_reviews.find('.sk_reviews_grid-item');
        var length = grid_item.length;
        if (length > 1) {
            sk_google_reviews.find(".sk-below-button-container").css({
                'width': (sk_google_reviews_width > 640 ? sk_google_reviews_width - 11 : sk_google_reviews_width) + "px",
            });
        }
        if (length == 1) {
            grid_item.css('width', '100%');
        }
    }
    function applyPopUpColors(sk_google_reviews) {
        var pop_up_bg_color = getDsmSetting(sk_google_reviews, "pop_up_bg_color");
        var pop_up_font_color = getDsmSetting(sk_google_reviews, "pop_up_font_color");
        var pop_up_link_color = getDsmSetting(sk_google_reviews, "pop_up_link_color");
        sk_google_reviews.find('.sk-review-popup').css({
            'color': pop_up_font_color,
            'background': pop_up_bg_color
        });
        sk_google_reviews.find('.sk-review-popup a').css({
            'color': pop_up_link_color
        });
    }
    function loadGoogleFont(font_family) {
        var web_safe_fonts = ["Inherit", "Impact, Charcoal, sans-serif", "'Palatino Linotype', 'Book Antiqua', Palatino, serif", "Century Gothic, sans-serif", "'Lucida Sans Unicode', 'Lucida Grande', sans-serif", "Verdana, Geneva, sans-serif", "Copperplate, 'Copperplate Gothic Light', fantasy", "'Courier New', Courier, monospace", "Georgia, Serif"];
        if (!web_safe_fonts.includes(font_family)) {
            try {
                loadCssFile("https://fonts.googleapis.com/css?family=" + font_family);
            } catch (error) {}
        }
    }
    function readableNumber(number) {
        number = parseInt(number);
        number = number ? number.toLocaleString("en-US") : 0;
        return number;
    }
    function addDescriptiveTagAttributes(_sk, add_to_img=true) {
        _sk.find('a').each(function(i, v) {
            var title = jQuery(v).text();
            jQuery(v).attr('title', title);
        });
        if (add_to_img) {
            _sk.find('img').each(function(i, v) {
                var src = jQuery(v).attr('src');
                jQuery(v).attr('alt', 'Post image');
            });
        }
    }
    function getClientId() {
        var _gaCookie = document.cookie.match(/(^|[;,]\s?)_ga=([^;,]*)/);
        if (_gaCookie)
            return _gaCookie[2].match(/\d+\.\d+$/)[0];
    }
    function getSkEmbedId(sk_class) {
        var embed_id = sk_class.attr('embed-id');
        if (embed_id == undefined) {
            embed_id = sk_class.attr('data-embed-id');
        }
        return embed_id;
    }
    function getSkSetting(sk_class, key) {
        return sk_class.find("div." + key).text();
    }
    function setCookieSameSite() {
        document.cookie = "AC-C=ac-c;expires=Fri, 31 Dec 2025 23:59:59 GMT;path=/;HttpOnly;SameSite=Lax";
    }
    function getIEVersion() {
        var sAgent = window.navigator.userAgent;
        var Idx = sAgent.indexOf("MSIE");
        if (Idx > 0)
            return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)));
        else if (!!navigator.userAgent.match(/Trident\/7\./))
            return 11;
        else
            return 0;
    }
    function isSafariBrowser() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf('safari') != -1) {
            if (ua.indexOf('chrome') > -1) {
                return 0;
            } else {
                return 1;
            }
        }
    }
    if (getIEVersion() > 0 || isSafariBrowser() > 0) {
        loadIEScript('https://cdn.jsdelivr.net/bluebird/3.5.0/bluebird.min.js');
        loadIEScript('https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.3/fetch.js');
    }
    function loadIEScript(url) {
        var scriptTag = document.createElement('script');
        scriptTag.setAttribute("type", "text/javascript");
        scriptTag.setAttribute("src", url);
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptTag);
    }
    function kFormatter(num) {
        return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
    }
    function sk_increaseView(user_info) {
        try {
            if (user_info && user_info.status && (user_info.status == 1 || user_info.status == 6 || user_info.status == 7)) {
                jQuery.getJSON('https://api.ipify.org?format=json', function(data) {
                    var update_views_url = "https://views.accentapi.com/add_view.php?user_id=" + user_info.id + "&url=" + document.URL + "&ip_address=" + data.ip + "&embed_id=" + user_info.embed_id;
                    if (app_url.includes("local") && sk_app_url) {
                        update_views_url = "https://localtesting.com/accentapiviews/add_view.php?user_id=" + user_info.id + "&url=" + document.URL + "&ip_address=" + data.ip + "&embed_id=" + user_info.embed_id;
                    }
                    jQuery.ajax(update_views_url);
                });
            }
        } catch (err) {
            console.log("Error retrieving ip address.");
        }
    }
    function isTooDarkColor(hexcolor) {
        var r = parseInt(hexcolor.substr(1, 2), 16);
        var g = parseInt(hexcolor.substr(3, 2), 16);
        var b = parseInt(hexcolor.substr(4, 2), 16);
        if (hexcolor.indexOf('rgb') != -1) {
            let rgbstr = hexcolor;
            let v = getRGB(rgbstr);
            r = v[0];
            g = v[1];
            b = v[2];
        }
        b = isNaN(b) ? 0 : b;
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        if (yiq < 60) {} else {}
        return yiq < 60 ? true : false;
    }
    function linkify(html) {
        var temp_text = html.split("https://www.").join("https://");
        temp_text = temp_text.split("www.").join("https://www.");
        var exp = /((href|src)=["']|)(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return temp_text.replace(exp, function() {
            return arguments[1] ? arguments[0] : "<a href=\"" + arguments[3] + "\">" + arguments[3] + "</a>"
        });
    }
    function skGetEnvironmentUrls(folder_name) {
        var scripts = document.getElementsByTagName("script");
        var scripts_length = scripts.length;
        var search_result = -1;
        var other_result = -1;
        var app_url = "https://widgets.sociablekit.com/";
        var app_backend_url = "https://api.accentapi.com/v1/";
        var app_file_server_url = "https://data.accentapi.com/feed/";
        var sk_app_url = "https://sociablekit.com/app/";
        var sk_api_url = "https://api.sociablekit.com/";
        var sk_img_url = "https://images.sociablekit.com/";
        var sk_fb_sync_url = "https://facebook-sync.sociablekit.com/";
        for (var i = 0; i < scripts_length; i++) {
            var src_str = scripts[i].getAttribute('src');
            if (src_str != null) {
                var other_folder = "";
                if (folder_name == 'facebook-page-playlists') {
                    other_folder = 'facebook-page-playlist';
                } else if (folder_name == 'linkedin-page-posts') {
                    other_folder = 'linkedin-page-post';
                } else if (folder_name == 'linkedin-profile-posts') {
                    other_folder = 'linkedin-profile-post';
                } else if (folder_name == 'facebook-hashtag-posts') {
                    other_folder = 'facebook-hashtag-feed';
                } else if (folder_name == 'facebook-page-events') {
                    other_folder = 'facebook-events';
                } else if (folder_name == 'facebook-page-posts') {
                    other_folder = 'facebook-feed';
                    if (document.querySelector(".sk-ww-facebook-feed")) {
                        var element = document.getElementsByClassName("sk-ww-facebook-feed")[0];
                        element.classList.add("sk-ww-facebook-page-posts");
                    }
                }
                other_result = src_str.search(other_folder);
                search_result = src_str.search(folder_name);
                if (search_result >= 1 || other_result >= 1) {
                    var src_arr = src_str.split(folder_name);
                    app_url = src_arr[0];
                    app_url = app_url.replace("displaysocialmedia.com", "sociablekit.com");
                    if (app_url.search("local") >= 1) {
                        app_backend_url = "http://localhost:3000/v1/";
                        app_url = "https://localtesting.com/SociableKIT_Widgets/";
                        app_file_server_url = "https://localtesting.com/SociableKIT_FileServer/feed/";
                        sk_app_url = "https://localtesting.com/SociableKIT/";
                        sk_api_url = "http://127.0.0.1:8000/";
                        sk_img_url = "https://localtesting.com/SociableKIT_Images/";
                        sk_fb_sync_url = "https://localtesting.com/SociableKIT_Facebook_Sync/";
                    } else {
                        app_url = "https://widgets.sociablekit.com/";
                    }
                }
            }
        }
        return {
            "app_url": app_url,
            "app_backend_url": app_backend_url,
            "app_file_server_url": app_file_server_url,
            "sk_api_url": sk_api_url,
            "sk_app_url": sk_app_url,
            "sk_img_url": sk_img_url,
            "sk_fb_sync_url": sk_fb_sync_url
        };
    }
    function changeBackSlashToBR(text) {
        if (text) {
            for (var i = 1; i <= 10; i++) {
                text = text.replace('\n', '</br>');
            }
        }
        return text;
    }
    function sKGetScrollbarWidth() {
        var outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);
        var inner = document.createElement('div');
        outer.appendChild(inner);
        var scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
        outer.parentNode.removeChild(outer);
        return scrollbarWidth;
    }
    function isValidURL(url) {
        const urlPattern = /^(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
        return urlPattern.test(url);
    }
    async function showUrlData(element, url, post_id, type="", show_thumbnail=1) {
        element.hide();
        var free_data_url = app_file_server_url.replace("feed/", "get_fresh_url_tags.php") + '?post_id=' + post_id + '&url=' + url;
        var read_one_url = app_file_server_url.replace("feed", "url-tags") + post_id + ".json";
        if (jQuery('.sk_version').text()) {
            read_one_url += "?v=" + jQuery('.sk_version').text();
        }
        fetch(read_one_url, {
            method: 'get',
            cache: 'no-cache'
        }).then(async response=>{
            if (response.ok) {
                let data = await response.json();
                if (data && data.status && data.status == 418) {
                    displayUrlData(data, element, type, show_thumbnail, post_id);
                    data = await jQuery.ajax(free_data_url);
                }
                return data;
            } else {
                response = await jQuery.ajax(free_data_url);
                displayUrlData(response, element, type, show_thumbnail, post_id);
                return response;
            }
        }
        ).then(async response=>{
            if (response != undefined) {
                displayUrlData(response, element, type, show_thumbnail, post_id);
            } else {
                response = await jQuery.ajax(free_data_url);
                displayUrlData(response, element, type, show_thumbnail, post_id);
            }
        }
        ).catch(async error=>{
            var data = await jQuery.ajax(free_data_url);
            displayUrlData(data, element, type, show_thumbnail, post_id);
        }
        );
    }
    async function displayUrlData(response, element, type, show_thumbnail=1, post_id) {
        var meta_holder = jQuery(element);
        var html = "";
        if (!response || response.error) {
            if (meta_holder.html()) {
                meta_holder.show();
            }
            return;
        }
        if (response.message && response.message == "Data not available. Please try again.") {
            return;
        }
        if (response.messages && response.messages.length > 0 && response.messages[0] == "PDF files that are over 10Mb are not supported by Google Docs Viewer") {
            var data = response.url;
            if (response.url) {
                data = response.url.replace("https://", "").split("/");
            }
            if (data.length > 0) {
                if (data.length > 1) {
                    response.title = data[data.length - 1];
                }
                response.description = data[0].replace("www.", "");
            }
        }
        if (post_id == "7059257055500492800") {
            response.url += "?id=122630";
        }
        html += "<a href='" + response.url + "' link-only target='_blank'>";
        html += "<div class='sk-link-article-container' style='background: #eeeeee;color: black !important; font-weight: bold !important; border-radius: 2px; border: 1px solid #c3c3c3; box-sizing: border-box; word-wrap: break-word;'>";
        if (show_thumbnail == 1) {
            html += "<image alt='No alternative text description for this image' class='sk-link-article-image sk_post_img_link' onerror='this.style.display=\"none\"' src='" + response.thumbnail_url + "'/>";
        }
        if (response.title) {
            html += "<div class='sk-link-article-title' style='padding: 8px;'>" + response.title + "</div>";
        } else if (response.url && response.url.indexOf(".pdf") != -1) {
            html += response.html;
        }
        if (type && type == 6) {
            if (response.description && response.description.length > 0) {
                response.description = response.description.length > 140 ? response.description.substring(0, 140) + ' ...' : response.description;
            }
        }
        if (response.description && response.description.indexOf("[vc_row]") !== -1 && response.url) {
            var pathArray = response.url.split('/');
            var protocol = pathArray[0];
            if (pathArray.length > 2) {
                var host = pathArray[2];
                var url = protocol + '//' + host;
                html += "<div class='sk-link-article-description' style='padding: 8px;color: grey;font-weight: 100;font-size: 14px;'>" + url + "</div>";
            }
        } else if (response.description && response.description.indexOf("fb_built") == -1 && response.description != "null") {
            if (response.url) {
                var domain = new URL(response.url).hostname;
                response.description = domain;
            }
            html += "<div class='sk-link-article-description' style='padding: 8px;color: #000000;font-weight: 100;font-size: 14px;'>" + response.description + "</div>";
        } else if (response.url && response.url.includes('instagram.com/p/')) {
            html += "<image style='padding: 8px;' alt='No alternative text description for this image' class='sk-ig-default' onerror='this.style.display=\"none\"' src='https://i1.wp.com/sociablekit.com/wp-content/uploads/2019/01/instagram.png'/>";
            html += "<div class='sk-link-article-description' style='padding: 8px;margin-left:15%;color: #000000;font-weight: 600;font-size: 14px;'>View this post in instagram</div>";
            html += "<div class='sk-link-article-description' style='padding: 0px 8px ;margin-left:15%;margin-bottom:10px;color: #000000;font-weight: 100;font-size: 10px;'>" + response.url + "</div>";
        }
        html += "</div>";
        html += "</a>";
        meta_holder.html(html);
        meta_holder.css('display', 'block');
        meta_holder.css('margin-bottom', '15px');
        meta_holder.find('.sk-ig-default').closest('.sk-link-article-container').css('display', 'inline-block');
        meta_holder.find('.sk-ig-default').closest('.sk-link-article-container').css('width', '100%');
        meta_holder.find('.sk-ig-default').css('width', '20%');
        meta_holder.find('.sk-ig-default').css('float', 'left');
        applyMasonry();
    }
    function slugifyString(str) {
        str = str.replace(/^\s+|\s+$/g, '');
        str = str.toLowerCase();
        var from = "ÃÃ„Ã‚Ã€ÃƒÃ…ÄŒÃ‡Ä†ÄŽÃ‰ÄšÃ‹ÃˆÃŠáº¼Ä”È†ÃÃŒÃŽÃÅ‡Ã‘Ã“Ã–Ã’Ã”Ã•Ã˜Å˜Å”Å Å¤ÃšÅ®ÃœÃ™Ã›ÃÅ¸Å½Ã¡Ã¤Ã¢Ã Ã£Ã¥ÄÃ§Ä‡ÄÃ©Ä›Ã«Ã¨Ãªáº½Ä•È‡Ã­Ã¬Ã®Ã¯ÅˆÃ±Ã³Ã¶Ã²Ã´ÃµÃ¸Ã°Å™Å•Å¡Å¥ÃºÅ¯Ã¼Ã¹Ã»Ã½Ã¿Å¾Ã¾ÃžÄÄ‘ÃŸÃ†aÂ·/_,:;";
        var to = "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";
        for (var i = 0, l = from.length; i < l; i++) {
            str = str.replace(new RegExp(from.charAt(i),'g'), to.charAt(i));
        }
        str = str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        return str;
    }
    function skGetBranding(sk_, user_info) {
        sk_.find('.sk_branding').remove();
        sk_.find('div.user_email').remove();
        var html = "";
        if (!user_info)
            return;
        var slugify_string = "";
        if (user_info.solution_name) {
            slugify_string = slugifyString(user_info.solution_name);
            user_info.tutorial_link = "https://www.sociablekit.com/tutorials/embed-" + slugify_string + "-website/";
            if (user_info.website_builder) {
                user_info.tutorial_link = "https://www.sociablekit.com/tutorials/embed-" + slugify_string;
                slugify_string = slugifyString(user_info.website_builder);
                user_info.tutorial_link = user_info.tutorial_link + "-" + slugify_string;
            }
        }
        if (user_info.type == 9) {
            user_info.tutorial_link = "https://www.sociablekit.com/sync-facebook-page-events-to-google-calendar/";
        } else if (user_info.type == 26) {
            user_info.tutorial_link = "https://www.sociablekit.com/how-to-sync-facebook-group-events-to-google-calendar-on-website/";
        }
        if (user_info.show_branding && (user_info.show_branding == 1 || user_info.show_branding == "true") || user_info.show_branding == true) {
            var fontFamily = getSkSetting(sk_, "font_family");
            var link_color = getSkSetting(sk_, "details_link_color");
            var details_bg_color = getSkSetting(sk_, "details_bg_color");
            if (link_color == "") {
                link_color = "rgb(52, 128, 220)";
            }
            if (details_bg_color && isTooDarkColor(link_color) == false && isTooDarkColor(details_bg_color) == false) {
                link_color = '#3480dc';
            }
            var temporary_tutorial_link = user_info.tutorial_link;
            if (temporary_tutorial_link.endsWith("/") == false) {
                temporary_tutorial_link = temporary_tutorial_link + "/";
            }
            var linkedin_widgets = [33, 34, 44, 58, 75, 99, 100, 103];
            if (linkedin_widgets.includes(user_info.type) && user_info.embed_id % 2 == 1) {
                var website_builder = "website";
                if (user_info.website_builder) {
                    website_builder = slugifyString(user_info.website_builder);
                }
                temporary_tutorial_link = "https://www.sociablekit.com/tutorials/embed-linkedin-feed-" + website_builder + "/";
            }
            if (user_info.type == 5 && user_info.embed_id % 2 == 1) {
                temporary_tutorial_link = temporary_tutorial_link.replace("profile", "feed")
            }
            var facebook_feed = [1, 4, 9, 10, 11, 36, 38, 43, 12, 24, 26, 49, 2, 8, 3, 18, 19, 28, 30, 61];
            if (facebook_feed.includes(user_info.type) && user_info.embed_id % 2 == 1) {
                var website_builder = "website";
                if (user_info.website_builder) {
                    website_builder = slugifyString(user_info.website_builder);
                }
                temporary_tutorial_link = "https://www.sociablekit.com/tutorials/embed-facebook-feed-" + website_builder + "/";
            }
            var threads_feed = [110];
            if (threads_feed.includes(user_info.type) && user_info.embed_id % 2 == 0) {
                var website_builder = "website";
                if (user_info.website_builder) {
                    website_builder = slugifyString(user_info.website_builder);
                }
                temporary_tutorial_link = "https://www.sociablekit.com/tutorials/embed-threads-" + website_builder + "/";
            }
            var nofollow_attribute = "";
            if (window.location.href.includes("clean-concept-plus")) {
                nofollow_attribute = "rel='nofollow'";
            }
            html += "<div class='sk_branding' style='padding:10px; display:block !important; text-align:center; text-decoration: none !important; color:#555; font-family:" + fontFamily + "; font-size:15px;'>";
            html += "<a " + nofollow_attribute + " class='tutorial_link' href='" + temporary_tutorial_link + "' target='_blank' style='text-underline-position:under; color:" + link_color + ";font-size:15px;'>";
            if (linkedin_widgets.includes(user_info.type) && user_info.embed_id % 2 == 1) {
                html += "Embed LinkedIn Feed on your ";
                if (user_info.website_builder && user_info.website_builder != "Website") {
                    html += user_info.website_builder;
                }
            } else if (facebook_feed.includes(user_info.type) && user_info.embed_id % 2 == 1) {
                html += "Embed Facebook Feed on your ";
                if (user_info.website_builder && user_info.website_builder != "Website") {
                    html += user_info.website_builder;
                }
            } else {
                html += "Embed " + user_info.solution_name + " on your ";
                if (user_info.website_builder && user_info.website_builder != "Website") {
                    html += user_info.website_builder;
                }
            }
            html += " website";
            html += "</a>";
            html += "</div>";
        }
        return html;
    }
    function getRGB(rgbstr) {
        return rgbstr.substring(4, rgbstr.length - 1).replace(/ /g, '').replace('(', '').split(',');
    }
    function freeTrialEndedMessage(solution_info) {
        var sk_error_message = "<div class='sk_trial_ended_message'>";
        sk_error_message += "Customized feed is powered by <strong><a href='https://www.sociablekit.com/' target='_blank'>SociableKIT</a></strong>.<br>";
        sk_error_message += "If you're the owner of this website, your 7-day Free Trial has ended.<br>";
        sk_error_message += "If you want to continue using our services, please <strong><a target='_blank' href='https://www.sociablekit.com/app/users/subscription/subscription'>subscribe now</a></strong>.";
        sk_error_message += "</div>";
        return sk_error_message;
    }
    function isFreeTrialEnded(start_date) {
        var start_date = new Date(start_date);
        var current_date = new Date();
        var difference = current_date.getTime() - start_date.getTime();
        difference = parseInt(difference / (1000 * 60 * 60 * 24));
        return difference > 7 ? true : false;
    }
    function unableToLoadSKErrorMessage(solution_info, additional_error_messages) {
        var sk_error_message = "<ul class='sk_error_message'>";
        sk_error_message += "<li><a href='" + solution_info.embed_id + "' target='_blank'>Customized " + solution_info.solution_name + " feed by SociableKIT</a></li>";
        console.log(solution_info);
        sk_error_message += "<li>Unable to load " + solution_info.solution_name + ".</li>";
        for (var i = 0; i < additional_error_messages.length; i++) {
            sk_error_message += additional_error_messages[i];
        }
        sk_error_message += "<li>If you think there is a problem, <a target='_blank' href='https://go.crisp.chat/chat/embed/?website_id=2e3a484e-b418-4643-8dd2-2355d8eddc6b'>chat with support here</a>. We will solve it for you.</li>";
        sk_error_message += "</ul>";
        return sk_error_message;
    }
    function widgetValidation(_sk, data) {
        if (data.user_info) {
            var user_info = data.user_info;
            user_info.trial_ended = false;
            if (user_info.status == 7 && user_info.cancellation_date) {
                var cancellation_date = new Date(user_info.cancellation_date).setHours(0, 0, 0, 0);
                var current_date = new Date().setHours(0, 0, 0, 0);
                user_info.show_feed = current_date > cancellation_date ? false : true;
                var activation_date = new Date(user_info.activation_date).setHours(0, 0, 0, 0);
                if (activation_date > cancellation_date) {
                    user_info.show_feed = true;
                }
            } else if (user_info.status == 0 || user_info.status == 2 || user_info.status == 10) {
                user_info.show_feed = false;
            }
            if (user_info.type == 43 || user_info.type == 38) {
                var sk_error_message = generateBlueMessage(_sk, user_info);
                _sk.find(".first_loading_animation").hide();
                _sk.html(sk_error_message);
            }
            if (!user_info.show_feed) {
                var sk_error_message = generateBlueMessage(_sk, user_info);
                _sk.find(".first_loading_animation").hide();
                _sk.html(sk_error_message);
            }
            return user_info.show_feed;
        }
    }
    function generateBlueMessage(_sk, user_info) {
        var tutorial_link = "";
        var sk_error_message = "";
        if (user_info.solution_name) {
            var slugify_string = slugifyString(user_info.solution_name);
            tutorial_link = "https://www.sociablekit.com/tutorials/embed-" + slugify_string + "-website/";
        }
        if (user_info.type == 9) {
            tutorial_link = "https://www.sociablekit.com/sync-facebook-page-events-to-google-calendar/";
        } else if (user_info.type == 26) {
            tutorial_link = "https://www.sociablekit.com/how-to-sync-facebook-group-events-to-google-calendar-on-website/";
        } else if (user_info.type == 43 || user_info.type == 38) {
            var sk_error_message = "<div class='sk_error_message'>";
            sk_error_message += "<p style='text-align: center !important; margin: 1rem'>" + user_info.solution_name + " are currently unavailable, please choose another <a href='https://www.sociablekit.com/demos/' target='_blank'>widget here</a></p>";
            sk_error_message += "</div>";
            return sk_error_message;
        }
        if (user_info.show_feed == false) {
            if (!user_info.message || user_info.message == "") {
                var sk_error_message = "<ul class='sk_error_message'>";
                sk_error_message += "<li><a href='" + tutorial_link + "' target='_blank'>" + user_info.solution_name + " powered by SociableKIT</a></li>";
                sk_error_message += "<li>If youâ€™re the owner of this website or SociableKIT account used, we found some errors with your account.</li>";
                sk_error_message += "<li>Please login your SociableKIT account to fix it.</li>";
                sk_error_message += "</ul>";
                user_info.message = sk_error_message;
            }
            sk_error_message = user_info.message;
        } else if (user_info.solution_name == null && user_info.type == null && user_info.start_date == null) {
            sk_error_message = "<p class='sk_error_message'>";
            sk_error_message += "The SociableKIT solution does not exist. If you think this is a mistake, please contact support.";
            sk_error_message += "</p>";
        } else {
            sk_error_message = "<div class='sk_error_message'>";
            sk_error_message += "<div style='display: inline-flex;width:100%;'>";
            sk_error_message += "<div>";
            sk_error_message += "<ul>";
            sk_error_message += "<li><a href='" + tutorial_link + "' target='_blank'>Customized " + user_info.solution_name + " feed by SociableKIT</a></li>";
            if (user_info.type == 5) {
                sk_error_message += "<li>Make sure your instagram account <a target='_blank' href='https://www.instagram.com/" + getDsmSetting(_sk, 'username') + "' target='_blank'><b>@" + getDsmSetting(_sk, 'username') + "</b></a> is connected.</li>";
            } else if (user_info.type == 22 || user_info.type == 39) {
                sk_error_message += "<li>Please make sure that the <a href='https://www.sociablekit.com/how-to-identify-google-place-id/' target='blank'><b> Google Place ID </b></a> you enter is correct.</li>";
            } else {
                sk_error_message += "<li>Please make sure that the <b> Source ID/Username </b> you enter is correct.</li>";
            }
            sk_error_message += "<li>Our system is syncing with your " + user_info.solution_name + " feed, please check back later.</li>";
            sk_error_message += "<li>It usually takes only a few minutes, but might take up to 24 hours. We appreciate your patience.</li>";
            sk_error_message += "<li>We will notify you via email once your " + user_info.solution_name + " feed is ready.</li>";
            sk_error_message += "<li>Please make sure that the source ID/Username you input is correct.</li>";
            sk_error_message += "<li>If you think there is a problem, <a target='_blank' href='https://go.crisp.chat/chat/embed/?website_id=2e3a484e-b418-4643-8dd2-2355d8eddc6b'>chat with support here</a>. We will solve it for you.</li>";
            sk_error_message += "</ul>";
            sk_error_message += "</div>";
            sk_error_message += "</div>";
            sk_error_message += "</div>";
        }
        return sk_error_message;
    }
    function generateSolutionMessage(_sk, embed_id) {
        var json_url = sk_api_url + "api/user_embed/info/" + embed_id;
        var sk_error_message = "";
        jQuery.getJSON(json_url, function(data) {
            if (data.type == 1 && data.encoded == true) {
                loadEvents(_sk);
            } else if (data.type == 44 && data.encoded == true) {
                loadFeed(_sk);
            } else if (data.type == 58 && data.encoded == true) {
                var no_data_text = _sk.find('.no_data_text').text();
                _sk.html("<div style='padding: 20px;text-align: center;'>" + no_data_text + "</div>");
            } else if (data.type == 67 && data.encoded == true) {
                loadEvents(_sk);
            } else if (data.type == 74 && data.encoded == true) {
                _sk.html("<div>No jobs yet, please try again later.</div>");
            } else {
                var sk_error_message = generateBlueMessage(_sk, data);
                _sk.find(".first_loading_animation").hide();
                _sk.html(sk_error_message);
            }
        }).fail(function(e) {
            console.log(e);
        });
    }
    function copyInput(copy_button, copy_input) {
        var copy_button_orig_html = copy_button.html();
        copy_input.select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            if (msg == 'successful') {
                copy_button.html("<i class='fa fa-clipboard'></i> Copied!");
                setTimeout(function() {
                    copy_button.html(copy_button_orig_html);
                }, 3000);
            } else {
                alert('Copying text command was ' + msg + '.');
            }
        } catch (err) {
            alert('Oops, unable to copy.');
        }
    }
    function getDefaultLinkedInPageProfilePicture(profile_picture) {
        if (profile_picture && profile_picture.indexOf("data:image/gif") != -1) {
            profile_picture = "https://gmalcilk.sirv.com/iamge.JPG";
        }
        return profile_picture;
    }
    function detectedSKDashboard() {
        let parent_url = (window.location != window.parent.location) ? document.referrer : document.location.href;
        if (parent_url && (parent_url.indexOf("sociablekit.com") != -1 || parent_url.indexOf("local") != -1)) {
            return true;
        }
        return false;
    }
    function getSKDashboardPremiumTrialMessage() {
        var sk_error_message = "";
        sk_error_message += "<ul class='sk_error_message'>";
        sk_error_message += "<li>Your 7-days premium trial has ended.</li>";
        sk_error_message += "<li>Please purchase a <a href='https://www.sociablekit.com/app/users/subscription/subscription?action=subscribe_now'>SociableKIT subscription plan</a> ";
        sk_error_message += "to save your widget customizations, save time with automatic sync, enjoy priority support, and get a 50% discount on any annual plans. Donâ€™t miss out!</li>";
        sk_error_message += "<li>You may also choose to <a href='https://help.sociablekit.com/en-us/article/how-to-activate-the-free-plan-1l3o0nt/'>activate the free plan</a> if you don't need our premium features.</li>";
        sk_error_message += "</ul>";
        return sk_error_message;
    }
    function getSocialIcon(category) {
        var post_items = '';
        if (category.indexOf("Facebook") != -1) {
            post_items += "<i class='fab fa-facebook' aria-hidden='true'></i>";
        } else if (category.indexOf("Instagram") != -1) {
            post_items += "<i class='fab fa-instagram' aria-hidden='true'></i>";
        } else if (category.indexOf("Linkedin") != -1) {
            post_items += "<i class='fab fa-linkedin' aria-hidden='true'></i>";
        } else if (category.indexOf("Youtube") != -1) {
            post_items += "<i class='fab fa-youtube' aria-hidden='true'></i>";
        } else if (category.indexOf("Google") != -1) {
            post_items += "<i class='fab fa-google' aria-hidden='true'></i>";
        } else if (category.indexOf("Twitter") != -1) {
            post_items += '<i class="fa-brands fa-x-twitter"></i>';
        } else if (category.indexOf("Twitch") != -1) {
            post_items += "<i class='fab fa-twitch' aria-hidden='true'></i>";
        } else if (category.indexOf("Yelp") != -1) {
            post_items += "<i class='fab fa-yelp' aria-hidden='true'></i>";
        } else if (category.indexOf("Vimeo") != -1) {
            post_items += "<i class='fab fa-vimeo' aria-hidden='true'></i>";
        } else if (category.indexOf("Twitch") != -1) {
            post_items += "<i class='fab fa-twitch' aria-hidden='true'></i>";
        } else if (category.indexOf("Trust") != -1) {
            post_items += "<i class='fab fa-trustpilot' aria-hidden='true'></i>";
        } else if (category.indexOf("Spot") != -1) {
            post_items += "<i class='fab fa-spotify' aria-hidden='true'></i>";
        }
        return post_items;
    }
    function isFontAwesomeLoaded() {
        var span = document.createElement('span');
        span.className = 'fa';
        span.style.display = 'none';
        document.body.insertBefore(span, document.body.firstChild);
        var font = css(span, 'font-family');
        if (font.indexOf("fontawesome") == -1) {
            return false;
        }
        document.body.removeChild(span);
        return true;
    }
    function css(element, property) {
        let font = window.getComputedStyle(element, null).getPropertyValue(property);
        if (font) {
            font = font.toLowerCase();
            return font.replace(/' '/g, "");
        }
        return 'na';
    }
    function translateMonthName(eng_month_name, sk_fb_group_event) {
        var month_name = "";
        if (eng_month_name == "JAN") {
            month_name = getDsmSetting(sk_fb_group_event, "jan");
        } else if (eng_month_name == "FEB") {
            month_name = getDsmSetting(sk_fb_group_event, "feb");
        } else if (eng_month_name == "MAR") {
            month_name = getDsmSetting(sk_fb_group_event, "mar");
        } else if (eng_month_name == "APR") {
            month_name = getDsmSetting(sk_fb_group_event, "apr");
        } else if (eng_month_name == "MAY") {
            month_name = getDsmSetting(sk_fb_group_event, "may");
        } else if (eng_month_name == "JUN") {
            month_name = getDsmSetting(sk_fb_group_event, "jun");
        } else if (eng_month_name == "JUL") {
            month_name = getDsmSetting(sk_fb_group_event, "jul");
        } else if (eng_month_name == "AUG") {
            month_name = getDsmSetting(sk_fb_group_event, "aug");
        } else if (eng_month_name == "SEP") {
            month_name = getDsmSetting(sk_fb_group_event, "sep");
        } else if (eng_month_name == "OCT") {
            month_name = getDsmSetting(sk_fb_group_event, "oct");
        } else if (eng_month_name == "NOV") {
            month_name = getDsmSetting(sk_fb_group_event, "nov");
        } else if (eng_month_name == "DEC") {
            month_name = getDsmSetting(sk_fb_group_event, "dec");
        }
        return month_name;
    }
    function translateDayName(eng_day_name, sk_fb_group_event) {
        var day_name = "";
        if (eng_day_name == "Sun") {
            day_name = getDsmSetting(sk_fb_group_event, "sun");
        } else if (eng_day_name == "Mon") {
            day_name = getDsmSetting(sk_fb_group_event, "mon");
        } else if (eng_day_name == "Tue") {
            day_name = getDsmSetting(sk_fb_group_event, "tue");
        } else if (eng_day_name == "Wed") {
            day_name = getDsmSetting(sk_fb_group_event, "wed");
        } else if (eng_day_name == "Thu") {
            day_name = getDsmSetting(sk_fb_group_event, "thu");
        } else if (eng_day_name == "Fri") {
            day_name = getDsmSetting(sk_fb_group_event, "fri");
        } else if (eng_day_name == "Sat") {
            day_name = getDsmSetting(sk_fb_group_event, "sat");
        }
        return day_name;
    }
    function getDayMonthTranslation(translation, replace) {
        if (translation == "Croatian") {
            return getCroatianDayMonth(replace);
        } else if (translation == "Italian") {
            return getItalianDayMonth(replace);
        } else if (translation == "Spanish") {
            return getSpanishDayMonth(replace);
        } else if (translation == "Norwegian") {
            return getNorwegianDayMonth(replace);
        } else if (translation == "Filipino") {
            return getFilipinoDayMonth(replace);
        } else if (translation == "French") {
            return getFrenchDayMonth(replace);
        } else if (translation == "German") {
            return getGermanDayMonth(replace);
        } else if (translation == "Polish") {
            return getPolishDayMonth(replace);
        } else if (translation == "Russian") {
            return getRussianDayMonth(replace);
        } else if (translation == "Faroese") {
            return getFaroeseDayMonth(replace);
        } else if (translation == "Portuguese") {
            return getPortugueseDayMonth(replace);
        } else if (translation == "Danish") {
            return getDanishDayMonth(replace);
        } else if (translation == "Dutch") {
            return getDutchDayMonth(replace);
        } else if (translation == "Swedish") {
            return getSwedishDayMonth(replace);
        } else if (translation == "Hungarian") {
            return getHungarianDayMonth(replace);
        } else if (translation == "Hebrew") {
            return getHebrewDayMonth(replace);
        } else if (translation == "Finnish") {
            return getFinnishDayMonth(replace);
        } else if (translation == "Slovak") {
            return getSlovakDayMonth(replace);
        } else if (translation == "Turkish") {
            return getTurkishDayMonth(replace);
        } else if (translation == "English - US" || translation == "English - UK") {
            return getEnglishDayMonth(replace);
        } else {
            return replace;
        }
    }
    function getEnglishDayMonth(replace) {
        return replace;
    }
    function getHebrewDayMonth(replace) {
        replace = str_replace("Sunday", "×¨××©×•×Ÿ", replace) ? str_replace("Sunday", "×¨××©×•×Ÿ", replace) : replace;
        replace = str_replace("Monday", "×©× ×™", replace) ? str_replace("Monday", "×©× ×™", replace) : replace;
        replace = str_replace("Tuesday", "×©×œ×™×©×™", replace) ? str_replace("Tuesday", "×©×œ×™×©×™", replace) : replace;
        replace = str_replace("Wednesday", "×¨×‘×™×¢×™", replace) ? str_replace("Wednesday", "×¨×‘×™×¢×™", replace) : replace;
        replace = str_replace("Thursday", "×—×ž×™×©×™", replace) ? str_replace("Thursday", "×—×ž×™×©×™", replace) : replace;
        replace = str_replace("Friday", "×©×™×©×™", replace) ? str_replace("Friday", "×©×™×©×™", replace) : replace;
        replace = str_replace("Saturday", "×©×‘×ª", replace) ? str_replace("Saturday", "×©×‘×ª", replace) : replace;
        replace = str_replace("Sun", "×¨××©×•×Ÿ", replace) ? str_replace("Sun", "×¨××©×•×Ÿ", replace) : replace;
        replace = str_replace("Mon", "×©× ×™", replace) ? str_replace("Mon", "×©× ×™", replace) : replace;
        replace = str_replace("Tue", "×©×œ×™×©×™", replace) ? str_replace("Tue", "×©×œ×™×©×™", replace) : replace;
        replace = str_replace("Wed", "×¨×‘×™×¢×™", replace) ? str_replace("Wed", "×¨×‘×™×¢×™", replace) : replace;
        replace = str_replace("Thu", "×—×ž×™×©×™", replace) ? str_replace("Thu", "×—×ž×™×©×™", replace) : replace;
        replace = str_replace("Fri", "×©×™×©×™", replace) ? str_replace("Fri", "×©×™×©×™", replace) : replace;
        replace = str_replace("Sat", "×©×‘×ª", replace) ? str_replace("Sat", "×©×‘×ª", replace) : replace;
        replace = str_replace("January", "×‘×™× ×•××¨", replace) ? str_replace("January", "×‘×™× ×•××¨", replace) : replace;
        replace = str_replace("February", "×‘×¤×‘×¨×•××¨", replace) ? str_replace("February", "×‘×¤×‘×¨×•××¨", replace) : replace;
        replace = str_replace("March", "×‘×ž×¨×¥", replace) ? str_replace("March", "×‘×ž×¨×¥", replace) : replace;
        replace = str_replace("April", "×‘××¤×¨×™×œ", replace) ? str_replace("April", "×‘××¤×¨×™×œ", replace) : replace;
        replace = str_replace("May", "×‘×ž××™", replace) ? str_replace("May", "×‘×ž××™", replace) : replace;
        replace = str_replace("June", "×‘×™×•× ×™", replace) ? str_replace("June", "×‘×™×•× ×™", replace) : replace;
        replace = str_replace("July", "×‘×™×•×œ×™", replace) ? str_replace("July", "×‘×™×•×œ×™", replace) : replace;
        replace = str_replace("August", "×‘××•×’×•×¡×˜", replace) ? str_replace("August", "×‘××•×’×•×¡×˜", replace) : replace;
        replace = str_replace("September", "×‘×¡×¤×˜×ž×‘×¨", replace) ? str_replace("September", "×‘×¡×¤×˜×ž×‘×¨", replace) : replace;
        replace = str_replace("October", "×‘××•×§×˜×•×‘×¨", replace) ? str_replace("October", "×‘××•×§×˜×•×‘×¨", replace) : replace;
        replace = str_replace("November", "×‘× ×•×‘×ž×‘×¨", replace) ? str_replace("November", "×‘× ×•×‘×ž×‘×¨", replace) : replace;
        replace = str_replace("December", "×‘×“×¦×ž×‘×¨", replace) ? str_replace("December", "×‘×“×¦×ž×‘×¨", replace) : replace;
        replace = str_replace("Jan", "×‘×™× ×•××¨", replace) ? str_replace("Jan", "×‘×™× ×•××¨", replace) : replace;
        replace = str_replace("Feb", "×‘×¤×‘×¨×•××¨", replace) ? str_replace("Feb", "×‘×¤×‘×¨×•××¨", replace) : replace;
        replace = str_replace("Mar", "×‘×ž×¨×¥", replace) ? str_replace("Mar", "×‘×ž×¨×¥", replace) : replace;
        replace = str_replace("Apr", "×‘××¤×¨×™×œ", replace) ? str_replace("Apr", "×‘××¤×¨×™×œ", replace) : replace;
        replace = str_replace("May", "×‘×ž××™", replace) ? str_replace("May", "×‘×ž××™", replace) : replace;
        replace = str_replace("Jun", "×‘×™×•× ×™", replace) ? str_replace("Jun", "×‘×™×•× ×™", replace) : replace;
        replace = str_replace("Jul", "×‘×™×•×œ×™", replace) ? str_replace("Jul", "×‘×™×•×œ×™", replace) : replace;
        replace = str_replace("Aug", "×‘××•×’×•×¡×˜", replace) ? str_replace("Aug", "×‘××•×’×•×¡×˜", replace) : replace;
        replace = str_replace("Sep", "×‘×¡×¤×˜×ž×‘×¨", replace) ? str_replace("Sep", "×‘×¡×¤×˜×ž×‘×¨", replace) : replace;
        replace = str_replace("Oct", "×‘××•×§×˜×•×‘×¨", replace) ? str_replace("Oct", "×‘××•×§×˜×•×‘×¨", replace) : replace;
        replace = str_replace("Nov", "×‘× ×•×‘×ž×‘×¨", replace) ? str_replace("Nov", "×‘× ×•×‘×ž×‘×¨", replace) : replace;
        replace = str_replace("Dec", "×‘×“×¦×ž×‘×¨", replace) ? str_replace("Dec", "×‘×“×¦×ž×‘×¨", replace) : replace;
        replace = str_replace("reviews", "×‘×™×§×•×¨×•×ª", replace) ? str_replace("reviews", "×‘×™×§×•×¨×•×ª", replace) : replace;
        replace = str_replace("Address", "×›×ª×•×‘×ª", replace) ? str_replace("Address", "×›×ª×•×‘×ª", replace) : replace;
        replace = str_replace("Website", "×ª×¨ ××™× ×˜×¨× ×˜", replace) ? str_replace("Website", "××ª×¨ ××™× ×˜×¨× ×˜", replace) : replace;
        replace = str_replace("Phone", "×˜×œ×¤×•×Ÿ", replace) ? str_replace("Phone", "×˜×œ×¤×•×Ÿ", replace) : replace;
        replace = str_replace("Business Hours", "×©×¢×•×ª ×¤×¢×™×œ×•×ª", replace) ? str_replace("Business Hours", "×©×¢×•×ª ×¤×¢×™×œ×•×ª", replace) : replace;
        replace = str_replace("Closed", "×¡Ö¸×’×•Ö¼×¨", replace) ? str_replace("Closed", "×¡Ö¸×’×•Ö¼×¨", replace) : replace;
        replace = str_replace("Coming soon", "×‘×§×¨×•×‘", replace) ? str_replace("Coming soon", "×‘×§×¨×•×‘", replace) : replace;
        replace = str_replace("PAST EVENT", "××™×¨×•×¢ ×¢×‘×¨", replace) ? str_replace("PAST EVENT", "××™×¨×•×¢ ×¢×‘×¨", replace) : replace;
        replace = str_replace("Search here...", "×—×¤×© ×›××Ÿ...", replace) ? str_replace("Search here...", "×—×¤×© ×›××Ÿ...", replace) : replace;
        return replace;
    }
    function getHungarianDayMonth(replace) {
        replace = str_replace("Sunday", "Vas", replace) ? str_replace("Sunday", "Vas", replace) : replace;
        replace = str_replace("Monday", "HÃ©t", replace) ? str_replace("Monday", "HÃ©t", replace) : replace;
        replace = str_replace("Tuesday", "Kedd", replace) ? str_replace("Tuesday", "Kedd", replace) : replace;
        replace = str_replace("Wednesday", "Sze", replace) ? str_replace("Wednesday", "Sze", replace) : replace;
        replace = str_replace("Thursday", "CsÃ¼", replace) ? str_replace("Thursday", "CsÃ¼", replace) : replace;
        replace = str_replace("Friday", "PÃ©n", replace) ? str_replace("Friday", "PÃ©n", replace) : replace;
        replace = str_replace("Saturday", "Szo", replace) ? str_replace("Saturday", "Szo", replace) : replace;
        replace = str_replace("January", "January", replace) ? str_replace("January", "January", replace) : replace;
        replace = str_replace("February", "February", replace) ? str_replace("February", "February", replace) : replace;
        replace = str_replace("March", "MÃ¡r", replace) ? str_replace("March", "MÃ¡r", replace) : replace;
        replace = str_replace("April", "Ãpr", replace) ? str_replace("April", "Ãpr", replace) : replace;
        replace = str_replace("May", "MÃ¡j", replace) ? str_replace("May", "MÃ¡j", replace) : replace;
        replace = str_replace("June", "JÃºn", replace) ? str_replace("June", "JÃºn", replace) : replace;
        replace = str_replace("July", "JÃºl", replace) ? str_replace("July", "JÃºl", replace) : replace;
        replace = str_replace("August", "August", replace) ? str_replace("August", "August", replace) : replace;
        replace = str_replace("September", "Sze", replace) ? str_replace("September", "Sze", replace) : replace;
        replace = str_replace("October", "Okt", replace) ? str_replace("October", "Okt", replace) : replace;
        replace = str_replace("November", "November", replace) ? str_replace("November", "November", replace) : replace;
        replace = str_replace("December", "December", replace) ? str_replace("December", "December", replace) : replace;
        replace = str_replace("reviews", "vÃ©lemÃ©nyek", replace) ? str_replace("reviews", "vÃ©lemÃ©nyek", replace) : replace;
        replace = str_replace("Address", "CÃ­m", replace) ? str_replace("Address", "CÃ­m", replace) : replace;
        replace = str_replace("Website", "Weboldal", replace) ? str_replace("Website", "Weboldal", replace) : replace;
        replace = str_replace("Phone", "Telefon", replace) ? str_replace("Phone", "Telefon", replace) : replace;
        replace = str_replace("Business Hours", "Munka Ã³rÃ¡k", replace) ? str_replace("Business Hours", "Munka Ã³rÃ¡k", replace) : replace;
        replace = str_replace("Closed", "ZÃ¡rva", replace) ? str_replace("Closed", "ZÃ¡rva", replace) : replace;
        replace = str_replace("Coming soon", "Hamarosan", replace) ? str_replace("Coming soon", "Hamarosan", replace) : replace;
        replace = str_replace("List", "Lista", replace) ? str_replace("List", "Lista", replace) : replace;
        replace = str_replace("Masonry", "KÅ‘mÅ±vessÃ©g", replace) ? str_replace("Masonry", "KÅ‘mÅ±vessÃ©g", replace) : replace;
        replace = str_replace("Grid", "RÃ¡cs", replace) ? str_replace("Grid", "RÃ¡cs", replace) : replace;
        replace = str_replace("Carousel", "KÃ¶rhinta", replace) ? str_replace("Carousel", "KÃ¶rhinta", replace) : replace;
        replace = str_replace("Month", "HÃ³nap", replace) ? str_replace("Month", "HÃ³nap", replace) : replace;
        replace = str_replace("Export Calendar", "NaptÃ¡r exportÃ¡lÃ¡sa", replace) ? str_replace("Export Calendar", "NaptÃ¡r exportÃ¡lÃ¡sa", replace) : replace;
        replace = str_replace("Search here...", "Itt keress...", replace) ? str_replace("Search here...", "Itt keress...", replace) : replace;
        return replace;
    }
    function getSwedishDayMonth(replace) {
        replace = str_replace("Sunday", "SÃ¶n", replace) ? str_replace("Sunday", "SÃ¶n", replace) : replace;
        replace = str_replace("Monday", "MÃ¥n", replace) ? str_replace("Monday", "MÃ¥n", replace) : replace;
        replace = str_replace("Tuesday", "Tis", replace) ? str_replace("Tuesday", "Tis", replace) : replace;
        replace = str_replace("Wednesday", "Ons", replace) ? str_replace("Wednesday", "Ons", replace) : replace;
        replace = str_replace("Thursday", "Tors", replace) ? str_replace("Thursday", "Tors", replace) : replace;
        replace = str_replace("Friday", "Fre", replace) ? str_replace("Friday", "Fre", replace) : replace;
        replace = str_replace("Saturday", "LÃ¶r", replace) ? str_replace("Saturday", "LÃ¶r", replace) : replace;
        replace = str_replace("January", "January", replace) ? str_replace("January", "January", replace) : replace;
        replace = str_replace("February", "February", replace) ? str_replace("February", "February", replace) : replace;
        replace = str_replace("March", "Mars", replace) ? str_replace("March", "Mars", replace) : replace;
        replace = str_replace("April", "April", replace) ? str_replace("April", "April", replace) : replace;
        replace = str_replace("May", "Maj", replace) ? str_replace("May", "Maj", replace) : replace;
        replace = str_replace("June", "June", replace) ? str_replace("June", "June", replace) : replace;
        replace = str_replace("July", "July", replace) ? str_replace("July", "July", replace) : replace;
        replace = str_replace("August", "August", replace) ? str_replace("August", "August", replace) : replace;
        replace = str_replace("September", "September", replace) ? str_replace("September", "September", replace) : replace;
        replace = str_replace("October", "Okt", replace) ? str_replace("October", "Okt", replace) : replace;
        replace = str_replace("November", "November", replace) ? str_replace("November", "November", replace) : replace;
        replace = str_replace("December", "December", replace) ? str_replace("December", "December", replace) : replace;
        replace = str_replace("reviews", "recensioner", replace) ? str_replace("reviews", "recensioner", replace) : replace;
        replace = str_replace("Address", "Adress", replace) ? str_replace("Address", "Adress", replace) : replace;
        replace = str_replace("Website", "Hemsida", replace) ? str_replace("Website", "Hemsida", replace) : replace;
        replace = str_replace("Phone", "Telefon", replace) ? str_replace("Phone", "Telefon", replace) : replace;
        replace = str_replace("Business Hours", "Kontorstid", replace) ? str_replace("Business Hours", "Kontorstid", replace) : replace;
        replace = str_replace("Closed", "StÃ¤ngd", replace) ? str_replace("Closed", "StÃ¤ngd", replace) : replace;
        replace = str_replace("Coming soon", "Kommer snart", replace) ? str_replace("Coming soon", "Kommer snart", replace) : replace;
        replace = str_replace("List", "Lista", replace) ? str_replace("List", "Lista", replace) : replace;
        replace = str_replace("Masonry", "Murverk", replace) ? str_replace("Masonry", "Murverk", replace) : replace;
        replace = str_replace("Grid", "RutnÃ¤t", replace) ? str_replace("Grid", "RutnÃ¤t", replace) : replace;
        replace = str_replace("Carousel", "Karusell", replace) ? str_replace("Carousel", "Karusell", replace) : replace;
        replace = str_replace("Month", "MÃ¥nad", replace) ? str_replace("Month", "MÃ¥nad", replace) : replace;
        replace = str_replace("Export Calendar", "Exportera kalender", replace) ? str_replace("Export Calendar", "Exportera kalender", replace) : replace;
        replace = str_replace("Search here...", "SÃ¶k hÃ¤r...", replace) ? str_replace("Search here...", "SÃ¶k hÃ¤r...", replace) : replace;
        return replace;
    }
    function getNorwegianDayMonth(replace) {
        replace = str_replace("Sunday", "SÃ¸n", replace) ? str_replace("Sunday", "SÃ¸n", replace) : replace;
        replace = str_replace("Monday", "Man", replace) ? str_replace("Monday", "Man", replace) : replace;
        replace = str_replace("Tuesday", "Tir", replace) ? str_replace("Tuesday", "Tir", replace) : replace;
        replace = str_replace("Wednesday", "Ons", replace) ? str_replace("Wednesday", "Ons", replace) : replace;
        replace = str_replace("Thursday", "Tor", replace) ? str_replace("Thursday", "Tor", replace) : replace;
        replace = str_replace("Friday", "Fre", replace) ? str_replace("Friday", "Fre", replace) : replace;
        replace = str_replace("Saturday", "LÃ¸r", replace) ? str_replace("Saturday", "LÃ¸r", replace) : replace;
        replace = str_replace("Sun", "SÃ¸n", replace) ? str_replace("Sun", "SÃ¸n", replace) : replace;
        replace = str_replace("Mon", "Man", replace) ? str_replace("Mon", "Man", replace) : replace;
        replace = str_replace("Tue", "Tir", replace) ? str_replace("Tue", "Tir", replace) : replace;
        replace = str_replace("Wed", "Ons", replace) ? str_replace("Wed", "Ons", replace) : replace;
        replace = str_replace("Thu", "Tor", replace) ? str_replace("Thu", "Tor", replace) : replace;
        replace = str_replace("Fri", "Fre", replace) ? str_replace("Fri", "Fre", replace) : replace;
        replace = str_replace("Sat", "LÃ¸r", replace) ? str_replace("Sat", "LÃ¸r", replace) : replace;
        replace = str_replace("January", "Januar", replace) ? str_replace("January", "Januar", replace) : replace;
        replace = str_replace("February", "Februar", replace) ? str_replace("February", "Februar", replace) : replace;
        replace = str_replace("March", "Mars", replace) ? str_replace("March", "Mars", replace) : replace;
        replace = str_replace("April", "April", replace) ? str_replace("April", "April", replace) : replace;
        replace = str_replace("May", "Mai", replace) ? str_replace("May", "Mai", replace) : replace;
        replace = str_replace("June", "Juni", replace) ? str_replace("June", "Juni", replace) : replace;
        replace = str_replace("July", "Juli", replace) ? str_replace("July", "Juli", replace) : replace;
        replace = str_replace("August", "August", replace) ? str_replace("August", "August", replace) : replace;
        replace = str_replace("September", "September", replace) ? str_replace("September", "September", replace) : replace;
        replace = str_replace("October", "Oktober", replace) ? str_replace("October", "Oktober", replace) : replace;
        replace = str_replace("November", "November", replace) ? str_replace("November", "November", replace) : replace;
        replace = str_replace("December", "Desember", replace) ? str_replace("December", "Desember", replace) : replace;
        replace = str_replace("reviews", "anmeldelser", replace) ? str_replace("reviews", "anmeldelser", replace) : replace;
        replace = str_replace("Address", "Adresse", replace) ? str_replace("Address", "Adresse", replace) : replace;
        replace = str_replace("Website", "Nettsted", replace) ? str_replace("Website", "Nettsted", replace) : replace;
        replace = str_replace("Phone", "Telefon", replace) ? str_replace("Phone", "Telefon", replace) : replace;
        replace = str_replace("Business Hours", "Arbeidstid", replace) ? str_replace("Business Hours", "Arbeidstid", replace) : replace;
        replace = str_replace("Closed", "Stengt", replace) ? str_replace("Closed", "Stengt", replace) : replace;
        replace = str_replace("Coming soon", "Kommer snart", replace) ? str_replace("Coming soon", "Kommer snart", replace) : replace;
        replace = str_replace("List", "Liste", replace) ? str_replace("List", "Liste", replace) : replace;
        replace = str_replace("Masonry", "Murverk", replace) ? str_replace("Masonry", "Murverk", replace) : replace;
        replace = str_replace("Grid", "Nett", replace) ? str_replace("Grid", "Nett", replace) : replace;
        replace = str_replace("Carousel", "Karusell", replace) ? str_replace("Carousel", "Karusell", replace) : replace;
        replace = str_replace("Month", "MÃ¥ned", replace) ? str_replace("Month", "MÃ¥ned", replace) : replace;
        replace = str_replace("Export Calendar", "Eksporter kalender", replace) ? str_replace("Export Calendar", "Eksporter kalender", replace) : replace;
        replace = str_replace("Search here...", "SÃ¸k her...", replace) ? str_replace("Search here...", "SÃ¸k her...", replace) : replace;
        replace = str_replace("Date and time", "Dato og tid", replace) ? str_replace("Date and time", "Dato og tid", replace) : replace;
        replace = str_replace("Location", "Lokasjon", replace) ? str_replace("Location", "Lokasjon", replace) : replace;
        replace = str_replace("Description", "Beskrivelse", replace) ? str_replace("Description", "Beskrivelse", replace) : replace;
        return replace;
    }
    function getFilipinoDayMonth(replace) {
        replace = str_replace("Sunday", "Lin", replace) ? str_replace("Sunday", "Lin", replace) : replace;
        replace = str_replace("Monday", "Lun", replace) ? str_replace("Monday", "Lun", replace) : replace;
        replace = str_replace("Tuesday", "March", replace) ? str_replace("Tuesday", "March", replace) : replace;
        replace = str_replace("Wednesday", "Miy", replace) ? str_replace("Wednesday", "Miy", replace) : replace;
        replace = str_replace("Thursday", "Huw", replace) ? str_replace("Thursday", "Huw", replace) : replace;
        replace = str_replace("Friday", "Biy", replace) ? str_replace("Friday", "Biy", replace) : replace;
        replace = str_replace("Saturday", "Sab", replace) ? str_replace("Saturday", "Sab", replace) : replace;
        replace = str_replace("January", "Enero", replace) ? str_replace("January", "Enero", replace) : replace;
        replace = str_replace("February", "Pebrero", replace) ? str_replace("February", "Pebrero", replace) : replace;
        replace = str_replace("March", "Marso", replace) ? str_replace("March", "Marso", replace) : replace;
        replace = str_replace("April", "Abril", replace) ? str_replace("April", "Abril", replace) : replace;
        replace = str_replace("May", "Mayo", replace) ? str_replace("May", "Mayo", replace) : replace;
        replace = str_replace("June", "Hunyo", replace) ? str_replace("June", "Hunyo", replace) : replace;
        replace = str_replace("July", "Hulyo", replace) ? str_replace("July", "Hulyo", replace) : replace;
        replace = str_replace("August", "Agosto", replace) ? str_replace("August", "Agosto", replace) : replace;
        replace = str_replace("September", "Setyembre", replace) ? str_replace("September", "Setyembre", replace) : replace;
        replace = str_replace("October", "Oktubre", replace) ? str_replace("October", "Oktubre", replace) : replace;
        replace = str_replace("November", "Nobyembre", replace) ? str_replace("November", "Nobyembre", replace) : replace;
        replace = str_replace("December", "Desyembre", replace) ? str_replace("December", "Desyembre", replace) : replace;
        replace = str_replace("reviews", "mga pagsusuri", replace) ? str_replace("reviews", "mga pagsusuri", replace) : replace;
        replace = str_replace("Address", "Address", replace) ? str_replace("Address", "Address", replace) : replace;
        replace = str_replace("Website", "Website", replace) ? str_replace("Website", "Website", replace) : replace;
        replace = str_replace("Phone", "Telepono", replace) ? str_replace("Phone", "Telepono", replace) : replace;
        replace = str_replace("Business Hours", "Oras ng trabaho", replace) ? str_replace("Business Hours", "Oras ng trabaho", replace) : replace;
        replace = str_replace("Closed", "Sarado", replace) ? str_replace("Closed", "Sarado", replace) : replace;
        replace = str_replace("Coming soon", "Malapit na", replace) ? str_replace("Coming soon", "Malapit na", replace) : replace;
        replace = str_replace("Search here...", "Maghanap dito...", replace) ? str_replace("Search here...", "Maghanap dito...", replace) : replace;
        return replace;
    }
    function getCroatianDayMonth(replace) {
        replace = str_replace("Sunday", "Ned", replace) ? str_replace("Sunday", "Ned", replace) : replace;
        replace = str_replace("Monday", "Pon", replace) ? str_replace("Monday", "Pon", replace) : replace;
        replace = str_replace("Tuesday", "Uto", replace) ? str_replace("Tuesday", "Uto", replace) : replace;
        replace = str_replace("Wednesday", "Sri", replace) ? str_replace("Wednesday", "Sri", replace) : replace;
        replace = str_replace("Thursday", "ÄŒet", replace) ? str_replace("Thursday", "ÄŒet", replace) : replace;
        replace = str_replace("Friday", "Pet", replace) ? str_replace("Friday", "Pet", replace) : replace;
        replace = str_replace("Saturday", "Sub", replace) ? str_replace("Saturday", "Sub", replace) : replace;
        replace = str_replace("January", "Sij", replace) ? str_replace("January", "Sij", replace) : replace;
        replace = str_replace("February", "Velj", replace) ? str_replace("February", "Velj", replace) : replace;
        replace = str_replace("March", "Ozu", replace) ? str_replace("March", "Ozu", replace) : replace;
        replace = str_replace("April", "Tra", replace) ? str_replace("April", "Tra", replace) : replace;
        replace = str_replace("May", "Svi", replace) ? str_replace("May", "Svi", replace) : replace;
        replace = str_replace("June", "Lip", replace) ? str_replace("June", "Lip", replace) : replace;
        replace = str_replace("July", "Srp", replace) ? str_replace("July", "Srp", replace) : replace;
        replace = str_replace("August", "Kol", replace) ? str_replace("August", "Kol", replace) : replace;
        replace = str_replace("September", "Ruj", replace) ? str_replace("September", "Ruj", replace) : replace;
        replace = str_replace("October", "Lis", replace) ? str_replace("October", "Lis", replace) : replace;
        replace = str_replace("November", "Stu", replace) ? str_replace("November", "Stu", replace) : replace;
        replace = str_replace("December", "Pro", replace) ? str_replace("December", "Pro", replace) : replace;
        replace = str_replace("month ago", "prije mjeseca", replace) ? str_replace("month ago", "prije mjeseca", replace) : replace;
        replace = str_replace("months ago", "prije mjeseca", replace) ? str_replace("months ago", "prije mjeseca", replace) : replace;
        replace = str_replace("day ago", "prije dana", replace) ? str_replace("day ago", "prije dana", replace) : replace;
        replace = str_replace("days ago", "prije dana", replace) ? str_replace("days ago", "prije dana", replace) : replace;
        replace = str_replace("year ago", "prije godinu", replace) ? str_replace("year ago", "prije godinu", replace) : replace;
        replace = str_replace("years ago", "prije godinu", replace) ? str_replace("years ago", "prije godinu", replace) : replace;
        replace = str_replace("Date and time", "Datum i vrijeme", replace) ? str_replace("Date and time", "Datum i vrijeme", replace) : replace;
        replace = str_replace("reviews", "recenzije", replace) ? str_replace("reviews", "recenzije", replace) : replace;
        replace = str_replace("Address", "Adresa", replace) ? str_replace("Address", "Adresa", replace) : replace;
        replace = str_replace("Website", "Web stranica", replace) ? str_replace("Website", "Web stranica", replace) : replace;
        replace = str_replace("Phone", "Telefon", replace) ? str_replace("Phone", "Telefon", replace) : replace;
        replace = str_replace("Business Hours", "Radno vrijeme", replace) ? str_replace("Business Hours", "Radno vrijeme", replace) : replace;
        replace = str_replace("Closed", "Zatvoreno", replace) ? str_replace("Closed", "Zatvoreno", replace) : replace;
        replace = str_replace("Coming soon", "Dolazi uskoro", replace) ? str_replace("Coming soon", "Dolazi uskoro", replace) : replace;
        replace = str_replace("List", "Popis", replace) ? str_replace("List", "Popis", replace) : replace;
        replace = str_replace("Masonry", "Zidarstvo", replace) ? str_replace("Masonry", "Zidarstvo", replace) : replace;
        replace = str_replace("Grid", "MreÅ¾a", replace) ? str_replace("Grid", "MreÅ¾a", replace) : replace;
        replace = str_replace("Carousel", "Karusel", replace) ? str_replace("Carousel", "Karusel", replace) : replace;
        replace = str_replace("Month", "Mjesec", replace) ? str_replace("Month", "Mjesec", replace) : replace;
        replace = str_replace("Export Calendar", "Izvoz kalendara", replace) ? str_replace("Export Calendar", "Izvoz kalendara", replace) : replace;
        replace = str_replace("Search here...", "TraÅ¾i ovdje...", replace) ? str_replace("Search here...", "TraÅ¾i ovdje...", replace) : replace;
        return replace;
    }
    function getItalianDayMonth(replace) {
        replace = str_replace("Sunday", "Domenica", replace) ? str_replace("Sunday", "Domenica", replace) : replace;
        replace = str_replace("Monday", "Lunedi", replace) ? str_replace("Monday", "Lunedi", replace) : replace;
        replace = str_replace("Tuesday", "MartedÃ¬", replace) ? str_replace("Tuesday", "MartedÃ¬", replace) : replace;
        replace = str_replace("Wednesday", "MercoledÃ¬", replace) ? str_replace("Wednesday", "MercoledÃ¬", replace) : replace;
        replace = str_replace("Thursday", "GiovedÃ¬", replace) ? str_replace("Thursday", "GiovedÃ¬", replace) : replace;
        replace = str_replace("Friday", "VenerdÃ¬", replace) ? str_replace("Friday", "VenerdÃ¬", replace) : replace;
        replace = str_replace("Saturday", "Sabato", replace) ? str_replace("Saturday", "Sabato", replace) : replace;
        replace = str_replace("January", "Gennaio", replace) ? str_replace("January", "Gennaio", replace) : replace;
        replace = str_replace("February", "Febbraio", replace) ? str_replace("February", "Febbraio", replace) : replace;
        replace = str_replace("March", "Marzo", replace) ? str_replace("March", "Marzo", replace) : replace;
        replace = str_replace("April", "Aprile", replace) ? str_replace("April", "Aprile", replace) : replace;
        replace = str_replace("May", "Maggio", replace) ? str_replace("May", "Maggio", replace) : replace;
        replace = str_replace("June", "Giugno", replace) ? str_replace("June", "Giugno", replace) : replace;
        replace = str_replace("July", "Luglio", replace) ? str_replace("July", "Luglio", replace) : replace;
        replace = str_replace("August", "Agosto", replace) ? str_replace("August", "Agosto", replace) : replace;
        replace = str_replace("September", "Settembre", replace) ? str_replace("September", "Settembre", replace) : replace;
        replace = str_replace("October", "Ottobre", replace) ? str_replace("October", "Ottobre", replace) : replace;
        replace = str_replace("November", "Novembre", replace) ? str_replace("November", "Novembre", replace) : replace;
        replace = str_replace("December", "Dicembre", replace) ? str_replace("December", "Dicembre", replace) : replace;
        replace = str_replace("month ago", "un mese fa", replace) ? str_replace("month ago", "un mese fa", replace) : replace;
        replace = str_replace("months ago", "un mese fa", replace) ? str_replace("months ago", "un mese fa", replace) : replace;
        replace = str_replace("day ago", "giorno fa", replace) ? str_replace("day ago", "giorno fa", replace) : replace;
        replace = str_replace("days ago", "giorni fa", replace) ? str_replace("days ago", "giorni fa", replace) : replace;
        replace = str_replace("year ago", "anno fa", replace) ? str_replace("year ago", "anno fa", replace) : replace;
        replace = str_replace("years ago", "anno fa", replace) ? str_replace("years ago", "anno fa", replace) : replace;
        replace = str_replace("Date and time", "Data e ora", replace) ? str_replace("Date and time", "Data e ora", replace) : replace;
        replace = str_replace("reviews", "recensioni", replace) ? str_replace("reviews", "recensioni", replace) : replace;
        replace = str_replace("Address", "Indirizzo", replace) ? str_replace("Address", "Indirizzo", replace) : replace;
        replace = str_replace("Website", "Sito web", replace) ? str_replace("Website", "Sito web", replace) : replace;
        replace = str_replace("Phone", "Telefono", replace) ? str_replace("Phone", "Telefono", replace) : replace;
        replace = str_replace("Business Hours", "Ore di lavoro", replace) ? str_replace("Business Hours", "Ore di lavoro", replace) : replace;
        replace = str_replace("Closed", "Chiusa", replace) ? str_replace("Closed", "Chiusa", replace) : replace;
        replace = str_replace("Coming soon", "Prossimamente", replace) ? str_replace("Coming soon", "Prossimamente", replace) : replace;
        replace = str_replace("second ago", "un secondo fa", replace) ? str_replace("second ago", "un secondo fa", replace) : replace;
        replace = str_replace("seconds ago", "secondi fa", replace) ? str_replace("seconds ago", "secondi fa", replace) : replace;
        replace = str_replace("minute ago", "un minuto fa", replace) ? str_replace("minute ago", "un minuto fa", replace) : replace;
        replace = str_replace("minutes ago", "minuti fa", replace) ? str_replace("minutes ago", "minuti fa", replace) : replace;
        replace = str_replace("hour ago", "un'ora fa", replace) ? str_replace("hour ago", "un'ora fa", replace) : replace;
        replace = str_replace("hours ago", "ore fa", replace) ? str_replace("hours ago", "ore fa", replace) : replace;
        replace = str_replace("month ago", "un mese fa", replace) ? str_replace("month ago", "un mese fa", replace) : replace;
        replace = str_replace("months ago", "mesi fa", replace) ? str_replace("months ago", "mesi fa", replace) : replace;
        replace = str_replace("day ago", "un giorno fa", replace) ? str_replace("day ago", "un giorno fa", replace) : replace;
        replace = str_replace("days ago", "giorni fa", replace) ? str_replace("days ago", "giorni fa", replace) : replace;
        replace = str_replace("year ago", "un anno fa", replace) ? str_replace("year ago", "un anno fa", replace) : replace;
        replace = str_replace("years ago", "anni fa", replace) ? str_replace("years ago", "anni fa", replace) : replace;
        replace = str_replace("List", "Elenco", replace) ? str_replace("List", "Elenco", replace) : replace;
        replace = str_replace("Masonry", "Opere murarie", replace) ? str_replace("Masonry", "Opere murarie", replace) : replace;
        replace = str_replace("Grid", "Griglia", replace) ? str_replace("Grid", "Griglia", replace) : replace;
        replace = str_replace("Carousel", "Giostra", replace) ? str_replace("Carousel", "Giostra", replace) : replace;
        replace = str_replace("Month", "Mese", replace) ? str_replace("Month", "Mese", replace) : replace;
        replace = str_replace("Export Calendar", "", replace) ? str_replace("Export Calendar", "Esporta calendario", replace) : replace;
        replace = str_replace("Search here...", "Cerca qui...", replace) ? str_replace("Search here...", "Cerca qui...", replace) : replace;
        return replace;
    }
    function getSpanishDayMonth(replace) {
        replace = str_replace("Sunday", "Dom", replace) ? str_replace("Sunday", "Dom", replace) : replace;
        replace = str_replace("Monday", "Lun", replace) ? str_replace("Monday", "Lun", replace) : replace;
        replace = str_replace("Tuesday", "Mar", replace) ? str_replace("Tuesday", "Mar", replace) : replace;
        replace = str_replace("Wednesday", "MiÃ©", replace) ? str_replace("Wednesday", "MiÃ©", replace) : replace;
        replace = str_replace("Thursday", "Jue", replace) ? str_replace("Thursday", "Jue", replace) : replace;
        replace = str_replace("Friday", "Vie", replace) ? str_replace("Friday", "Vie", replace) : replace;
        replace = str_replace("Saturday", "SÃ¡b", replace) ? str_replace("Saturday", "SÃ¡b", replace) : replace;
        replace = str_replace("January", "Enero", replace) ? str_replace("January", "Enero", replace) : replace;
        replace = str_replace("February", "Febrero", replace) ? str_replace("February", "Febrero", replace) : replace;
        replace = str_replace("March", "Marzo", replace) ? str_replace("March", "Marzo", replace) : replace;
        replace = str_replace("April", "Abril", replace) ? str_replace("April", "Abril", replace) : replace;
        replace = str_replace("May", "Mayo", replace) ? str_replace("May", "Mayo", replace) : replace;
        replace = str_replace("June", "Junio", replace) ? str_replace("June", "Junio", replace) : replace;
        replace = str_replace("July", "Julio", replace) ? str_replace("July", "Julio", replace) : replace;
        replace = str_replace("August", "Agosto", replace) ? str_replace("August", "Agosto", replace) : replace;
        replace = str_replace("September", "Septiembre", replace) ? str_replace("September", "Septiembre", replace) : replace;
        replace = str_replace("October", "Octubre", replace) ? str_replace("October", "Octubre", replace) : replace;
        replace = str_replace("November", "Noviembre", replace) ? str_replace("November", "Noviembre", replace) : replace;
        replace = str_replace("December", "Diciembre", replace) ? str_replace("December", "Diciembre", replace) : replace;
        replace = str_replace("month ago", "hace un mes", replace) ? str_replace("month ago", "hace un mes", replace) : replace;
        replace = str_replace("months ago", "hace un mes", replace) ? str_replace("months ago", "hace un mes", replace) : replace;
        replace = str_replace("second ago", "hace un segundo", replace) ? str_replace("second ago", "hace un segundo", replace) : replace;
        replace = str_replace("seconds ago", "segundos atrÃ¡s", replace) ? str_replace("seconds ago", "segundos atrÃ¡s", replace) : replace;
        replace = str_replace("minute ago", "hace un minuto", replace) ? str_replace("minute ago", "hace un minuto", replace) : replace;
        replace = str_replace("minutes ago", "minutos atrÃ¡s", replace) ? str_replace("minutes ago", "minutos atrÃ¡s", replace) : replace;
        replace = str_replace("hour ago", "hace una hora", replace) ? str_replace("hour ago", "hace una hora", replace) : replace;
        replace = str_replace("hours ago", "horas atrÃ¡s", replace) ? str_replace("hours ago", "horas atrÃ¡s", replace) : replace;
        replace = str_replace("month ago", "hace un mes", replace) ? str_replace("month ago", "hace un mes", replace) : replace;
        replace = str_replace("months ago", "meses atrÃ¡s", replace) ? str_replace("months ago", "meses atrÃ¡s", replace) : replace;
        replace = str_replace("day ago", "hace un dÃ­a", replace) ? str_replace("day ago", "hace un dÃ­a", replace) : replace;
        replace = str_replace("days ago", "dÃ­as atrÃ¡s", replace) ? str_replace("days ago", "dÃ­as atrÃ¡s", replace) : replace;
        replace = str_replace("year ago", "hace un aÃ±o", replace) ? str_replace("year ago", "hace un aÃ±o", replace) : replace;
        replace = str_replace("years ago", "aÃ±os atrÃ¡s", replace) ? str_replace("years ago", "aÃ±os atrÃ¡s", replace) : replace;
        replace = str_replace("Date and time", "Fecha y hora", replace) ? str_replace("Date and time", "Fecha y hora", replace) : replace;
        replace = str_replace("reviews", "reseÃ±as", replace) ? str_replace("reviews", "reseÃ±as", replace) : replace;
        replace = str_replace("Address", "DirecciÃ³n", replace) ? str_replace("Address", "DirecciÃ³n", replace) : replace;
        replace = str_replace("Website", "Sitio web", replace) ? str_replace("Website", "Sitio web", replace) : replace;
        replace = str_replace("Phone", "TelÃ©fono", replace) ? str_replace("Phone", "TelÃ©fono", replace) : replace;
        replace = str_replace("Business Hours", "Horas de trabajo", replace) ? str_replace("Business Hours", "Horas de trabajo", replace) : replace;
        replace = str_replace("Closed", "Cerrado", replace) ? str_replace("Closed", "Cerrado", replace) : replace;
        replace = str_replace("Coming soon", "Muy pronto", replace) ? str_replace("Coming soon", "Muy pronto", replace) : replace;
        replace = str_replace("List", "Lista", replace) ? str_replace("List", "Lista", replace) : replace;
        replace = str_replace("Masonry", "AlbaÃ±ilerÃ­a", replace) ? str_replace("Masonry", "AlbaÃ±ilerÃ­a", replace) : replace;
        replace = str_replace("Grid", "Red", replace) ? str_replace("Grid", "Red", replace) : replace;
        replace = str_replace("Carousel", "Carrusel", replace) ? str_replace("Carousel", "Carrusel", replace) : replace;
        replace = str_replace("Month", "Mes", replace) ? str_replace("Month", "Mes", replace) : replace;
        replace = str_replace("Export Calendar", "Calendario de exportaciÃ³n", replace) ? str_replace("Export Calendar", "Calendario de exportaciÃ³n", replace) : replace;
        replace = str_replace("Search here...", "Busca aquÃ­...", replace) ? str_replace("Search here...", "Busca aquÃ­...", replace) : replace;
        return replace;
    }
    function getFrenchDayMonth(replace) {
        replace = str_replace("Sunday", "dim", replace) ? str_replace("Sunday", "dim", replace) : replace;
        replace = str_replace("Monday", "lun", replace) ? str_replace("Monday", "lun", replace) : replace;
        replace = str_replace("Tuesday", "mar", replace) ? str_replace("Tuesday", "mar", replace) : replace;
        replace = str_replace("Wednesday", "mer", replace) ? str_replace("Wednesday", "mer", replace) : replace;
        replace = str_replace("Thursday", "jeu", replace) ? str_replace("Thursday", "jeu", replace) : replace;
        replace = str_replace("Friday", "ven", replace) ? str_replace("Friday", "ven", replace) : replace;
        replace = str_replace("Saturday", "sam", replace) ? str_replace("Saturday", "sam", replace) : replace;
        replace = str_replace("January", "Janvier", replace) ? str_replace("January", "Janvier", replace) : replace;
        replace = str_replace("February", "FÃ©vrier", replace) ? str_replace("February", "FÃ©vrier", replace) : replace;
        replace = str_replace("March", "Mars", replace) ? str_replace("March", "Mars", replace) : replace;
        replace = str_replace("April", "Avr", replace) ? str_replace("April", "Avr", replace) : replace;
        replace = str_replace("May", "Mai", replace) ? str_replace("May", "Mai", replace) : replace;
        replace = str_replace("June", "Juin", replace) ? str_replace("June", "Juin", replace) : replace;
        replace = str_replace("July", "Jui", replace) ? str_replace("July", "Jui", replace) : replace;
        replace = str_replace("August", "AoÃ»t", replace) ? str_replace("August", "AoÃ»t", replace) : replace;
        replace = str_replace("September", "Septembre", replace) ? str_replace("September", "Septembre", replace) : replace;
        replace = str_replace("October", "Octobre", replace) ? str_replace("October", "Octobre", replace) : replace;
        replace = str_replace("November", "Novembre", replace) ? str_replace("November", "Novembre", replace) : replace;
        replace = str_replace("December", "DÃ©cembre", replace) ? str_replace("December", "DÃ©cembre", replace) : replace;
        replace = str_replace("second ago", "il y a une seconde", replace) ? str_replace("second ago", "il y a une seconde", replace) : replace;
        replace = str_replace("seconds ago", "il y a quelques secondes", replace) ? str_replace("seconds ago", "il y a quelques secondes", replace) : replace;
        replace = str_replace("minute ago", "il y a une minute", replace) ? str_replace("minute ago", "il y a une minute", replace) : replace;
        replace = str_replace("minutes ago", "il y a quelques minutes", replace) ? str_replace("minutes ago", "il y a quelques minutes", replace) : replace;
        replace = str_replace("hour ago", "il y a une heure", replace) ? str_replace("hour ago", "il y a une heure", replace) : replace;
        replace = str_replace("hours ago", "il y a quelques heures", replace) ? str_replace("hours ago", "il y a quelques heures", replace) : replace;
        replace = str_replace("month ago", "il y a un mois", replace) ? str_replace("month ago", "il y a un mois", replace) : replace;
        replace = str_replace("months ago", "il y a quelques mois", replace) ? str_replace("months ago", "il y a quelques mois", replace) : replace;
        replace = str_replace("day ago", "il y a un jour", replace) ? str_replace("day ago", "il y a un jour", replace) : replace;
        replace = str_replace("days ago", "il y a quelques jours", replace) ? str_replace("days ago", "il y a quelques jours", replace) : replace;
        replace = str_replace("year ago", "il y a un an", replace) ? str_replace("year ago", "il y a un an", replace) : replace;
        replace = str_replace("years ago", "il y a quelques annÃ©es", replace) ? str_replace("years ago", "il y a quelques annÃ©es", replace) : replace;
        replace = str_replace("Date and time", "Date et l'heure", replace) ? str_replace("Date and time", "Date et l'heure", replace) : replace;
        replace = str_replace("reviews", "Commentaires", replace) ? str_replace("reviews", "Commentaires", replace) : replace;
        replace = str_replace("Address", "Adresse", replace) ? str_replace("Address", "Adresse", replace) : replace;
        replace = str_replace("Website", "Site Internet", replace) ? str_replace("Website", "Site Internet", replace) : replace;
        replace = str_replace("Phone", "TÃ©lÃ©phone fixe", replace) ? str_replace("Phone", "TÃ©lÃ©phone fixe", replace) : replace;
        replace = str_replace("Business Hours", "Heures de travail", replace) ? str_replace("Business Hours", "Heures de travail", replace) : replace;
        replace = str_replace("Closed", "FermÃ©e", replace) ? str_replace("Closed", "FermÃ©e", replace) : replace;
        replace = str_replace("Coming soon", "BientÃ´t disponible", replace) ? str_replace("Coming soon", "BientÃ´t disponible", replace) : replace;
        replace = str_replace("List", "Liste", replace) ? str_replace("List", "Liste", replace) : replace;
        replace = str_replace("Masonry", "MaÃ§onnerie", replace) ? str_replace("Masonry", "MaÃ§onnerie", replace) : replace;
        replace = str_replace("Grid", "Grille", replace) ? str_replace("Grid", "Grille", replace) : replace;
        replace = str_replace("Carousel", "Carrousel", replace) ? str_replace("Carousel", "Carrousel", replace) : replace;
        replace = str_replace("Month", "Mois", replace) ? str_replace("Month", "Mois", replace) : replace;
        replace = str_replace("Export Calendar", "Exporter le calendrier", replace) ? str_replace("Export Calendar", "Exporter le calendrier", replace) : replace;
        replace = str_replace("Search here...", "Cherche ici...", replace) ? str_replace("Search here...", "Cherche ici...", replace) : replace;
        return replace;
    }
    function getDayMonthWeekWordTranslation(translation, replace) {
        if (translation == "French") {
            return frenchDayMonthWeekTranslation(replace);
        }
        if (translation == "Danish") {
            return danishDayMonthWeekTranslation(replace);
        } else {
            return replace;
        }
    }
    function frenchDayMonthWeekTranslation(replace) {
        if (replace.indexOf("week") !== -1 || replace.indexOf("w") !== -1) {
            replace = str_replace("week", " semaine", replace) ? str_replace("week", " semaine", replace) : replace;
            replace = str_replace("w", " semaine", replace) ? str_replace("w", " semaine", replace) : replace;
        } else if (replace.indexOf("month") !== -1 || replace.indexOf("m") !== -1 || replace.indexOf("mo") !== -1) {
            if (replace.indexOf("month") !== -1) {
                replace = str_replace("month", " mois", replace) ? str_replace("month", " mois", replace) : replace;
            } else if (replace.indexOf("mo") !== -1) {
                replace = str_replace("mo", " mois", replace) ? str_replace("mo", " mois", replace) : replace;
            } else if (replace.indexOf("mo") !== -1) {
                replace = str_replace("m", " mois", replace) ? str_replace("m", " mois", replace) : replace;
            }
            return replace;
        } else if (replace.indexOf("day") !== -1 || replace.indexOf("d") !== -1) {
            replace = str_replace("day", " jour", replace) ? str_replace("day", " jour", replace) : replace;
            replace = str_replace("d", " jour", replace) ? str_replace("d", " jour", replace) : replace;
        } else if (replace.indexOf("year") !== -1 || replace.indexOf("y") !== -1) {
            replace = str_replace("year", " annÃ©es", replace) ? str_replace("y", " annÃ©es", replace) : replace;
            replace = str_replace("y", " annÃ©es", replace) ? str_replace("y", " annÃ©es", replace) : replace;
        }
        return parseInt(replace) > 1 ? replace + 's' : replace;
    }
    function danishDayMonthWeekTranslation(replace) {
        if (replace.indexOf("week") !== -1 || replace.indexOf("w") !== -1) {
            replace = str_replace("a week ago", " 1 uge siden", replace) ? str_replace("a week ago", " 1 uge siden", replace) : replace;
            if (replace.indexOf("week ago") !== -1) {
                replace = str_replace("week ago", " uge siden", replace) ? str_replace("week ago", " uge siden", replace) : replace;
            } else if (replace.indexOf("week") !== -1) {
                replace = str_replace("week", " uge", replace) ? str_replace("week", " uge", replace) : replace;
            } else {
                replace = str_replace("w", " uge", replace) ? str_replace("w", " uge", replace) : replace;
            }
        } else if (replace.indexOf("month") !== -1 || replace.indexOf("m") !== -1 || replace.indexOf("mo") !== -1) {
            replace = str_replace("a month ago", " 1 mÃ¥ned siden", replace) ? str_replace("a month ago", " 1 mÃ¥ned siden", replace) : replace;
            if (replace.indexOf("month ago") !== -1) {
                replace = str_replace("month ago", " mÃ¥ned siden", replace) ? str_replace("month ago", " mÃ¥ned siden", replace) : replace;
            } else if (replace.indexOf("months") !== -1) {
                replace = str_replace("months ago", " mÃ¥neder siden", replace) ? str_replace("months ago", " mÃ¥neder siden", replace) : replace;
            } else if (replace.indexOf("mo") !== -1) {
                replace = str_replace("mo", " mÃ¥ned", replace) ? str_replace("mo", " mÃ¥ned", replace) : replace;
            } else if (replace.indexOf("mo") !== -1) {
                replace = str_replace("m", " mÃ¥ned", replace) ? str_replace("m", " mÃ¥ned", replace) : replace;
            }
            return replace;
        } else if (replace.indexOf("day") !== -1 || replace.indexOf("d") !== -1) {
            if (replace.indexOf("day")) {
                replace = str_replace("a day ago", " 1 dag siden", replace) ? str_replace("a day ago", " 1 dag siden", replace) : replace;
                replace = str_replace("day ago", " dag siden", replace) ? str_replace("day ago", " dag siden", replace) : replace;
                replace = str_replace("days ago", " dage siden", replace) ? str_replace("days ago", " dage siden", replace) : replace;
                replace = str_replace("day", " dag", replace) ? str_replace("day", " dag", replace) : replace;
            } else {
                replace = str_replace("d", " dag", replace) ? str_replace("d", " dag", replace) : replace;
            }
        } else if (replace.indexOf("year") !== -1 || replace.indexOf("y") !== -1) {
            replace = str_replace("a year ago", " 1 Ã¥r siden", replace) ? str_replace("a year ago", " 1 Ã¥r siden", replace) : replace;
            if (replace.indexOf("years ago") !== -1) {
                replace = str_replace("years ago", " Ã¥r siden", replace) ? str_replace("years ago", " Ã¥r siden", replace) : replace;
            } else if (replace.indexOf("year") !== -1) {
                replace = str_replace("year", " Ã¥r", replace) ? str_replace("y", " Ã¥r", replace) : replace;
            } else {
                replace = str_replace("y", " Ã¥r", replace) ? str_replace("y", " Ã¥r", replace) : replace;
            }
        }
        if (replace.includes('siden')) {
            return replace;
        } else {
            return parseInt(replace) > 1 ? replace + 's' : replace;
        }
    }
    function getGermanDayMonth(replace) {
        replace = str_replace("Sunday", "So", replace) ? str_replace("Sunday", "So", replace) : replace;
        replace = str_replace("Monday", "Mo", replace) ? str_replace("Monday", "Mo", replace) : replace;
        replace = str_replace("Tuesday", "Di", replace) ? str_replace("Tuesday", "Di", replace) : replace;
        replace = str_replace("Wednesday", "Mi", replace) ? str_replace("Wednesday", "Mi", replace) : replace;
        replace = str_replace("Thursday", "Do", replace) ? str_replace("Thursday", "Do", replace) : replace;
        replace = str_replace("Friday", "Fr", replace) ? str_replace("Friday", "Fr", replace) : replace;
        replace = str_replace("Saturday", "Sa", replace) ? str_replace("Saturday", "Sa", replace) : replace;
        replace = str_replace("January", "January", replace) ? str_replace("January", "January", replace) : replace;
        replace = str_replace("February", "February", replace) ? str_replace("February", "February", replace) : replace;
        replace = str_replace("March", "MÃ¤r", replace) ? str_replace("March", "MÃ¤r", replace) : replace;
        replace = str_replace("April", "April", replace) ? str_replace("April", "April", replace) : replace;
        replace = str_replace("May", "Mai", replace) ? str_replace("May", "Mai", replace) : replace;
        replace = str_replace("June", "June", replace) ? str_replace("June", "June", replace) : replace;
        replace = str_replace("July", "July", replace) ? str_replace("July", "July", replace) : replace;
        replace = str_replace("August", "August", replace) ? str_replace("August", "August", replace) : replace;
        replace = str_replace("September", "September", replace) ? str_replace("September", "September", replace) : replace;
        replace = str_replace("October", "Okt", replace) ? str_replace("October", "Okt", replace) : replace;
        replace = str_replace("November", "November", replace) ? str_replace("November", "November", replace) : replace;
        replace = str_replace("December", "Dez", replace) ? str_replace("December", "Dez", replace) : replace;
        replace = str_replace("second ago", "vor einer Sekunde", replace) ? str_replace("second ago", "vor einer Sekunde", replace) : replace;
        replace = str_replace("seconds ago", "vor Sekunden", replace) ? str_replace("seconds ago", "vor Sekunden", replace) : replace;
        replace = str_replace("minute ago", "vor einer Minute", replace) ? str_replace("minute ago", "vor einer Minute", replace) : replace;
        replace = str_replace("minutes ago", "vor Minuten", replace) ? str_replace("minutes ago", "vor Minuten", replace) : replace;
        replace = str_replace("hour ago", "vor einer Stunde", replace) ? str_replace("hour ago", "vor einer Stunde", replace) : replace;
        replace = str_replace("hours ago", "vor Stunden", replace) ? str_replace("hours ago", "vor Stunden", replace) : replace;
        replace = str_replace("month ago", "vor einem Monat", replace) ? str_replace("month ago", "vor einem Monat", replace) : replace;
        replace = str_replace("months ago", "vor Monaten", replace) ? str_replace("months ago", "vor Monaten", replace) : replace;
        replace = str_replace("day ago", "vor einem Tag", replace) ? str_replace("day ago", "vor einem Tag", replace) : replace;
        replace = str_replace("days ago", "vor Tagen", replace) ? str_replace("days ago", "vor Tagen", replace) : replace;
        replace = str_replace("year ago", "vor einem Jahr", replace) ? str_replace("year ago", "vor einem Jahr", replace) : replace;
        replace = str_replace("years ago", "vor Jahren", replace) ? str_replace("years ago", "vor Jahren", replace) : replace;
        replace = str_replace("an hour ago", "Vor einem Stunde", replace) ? str_replace("an hour ago", "Vor einem Stunde", replace) : replace;
        replace = str_replace("1 hour ago", "Vor einem Stunde", replace) ? str_replace("1 hour ago", "Vor einem Stunde", replace) : replace;
        replace = str_replace("hour ago", "Vor einem Stunde", replace) ? str_replace("hour ago", "Vor einem Stunde", replace) : replace;
        if (replace.includes("hours ago")) {
            var quantity = parseInt(replace);
            if (quantity > 0) {
                replace = "Vor " + quantity + " Stunden";
            }
        }
        replace = str_replace("a month ago", "Vor einem Monat", replace) ? str_replace("a month ago", "Vor einem Monat", replace) : replace;
        if (replace.includes("months ago")) {
            var quantity = parseInt(replace);
            if (quantity > 0) {
                replace = "Vor " + quantity + " Monaten";
            }
        }
        replace = str_replace("a day ago", "Vor einem Tag", replace) ? str_replace("a day ago", "Vor einem Tag", replace) : replace;
        if (replace.includes("days ago")) {
            var quantity = parseInt(replace);
            if (quantity > 0) {
                replace = "Vor " + quantity + " Tagen";
            }
        }
        replace = str_replace("a year ago", "1 Jahre zuvor", replace) ? str_replace("a year ago", "1 Jahre zuvor", replace) : replace;
        replace = str_replace("years ago", "Jahre zuvor", replace) ? str_replace("years ago", "Jahre zuvor", replace) : replace;
        replace = str_replace("Date and time", "Datum (und Uhrzeit", replace) ? str_replace("Date and time", "Datum (und Uhrzeit", replace) : replace;
        replace = str_replace("reviews", "Bewertungen", replace) ? str_replace("reviews", "Bewertungen", replace) : replace;
        replace = str_replace("Address", "Address", replace) ? str_replace("Address", "Address", replace) : replace;
        replace = str_replace("Website", "Webseite", replace) ? str_replace("Website", "Webseite", replace) : replace;
        replace = str_replace("Phone", "Telefon", replace) ? str_replace("Phone", "Telefon", replace) : replace;
        replace = str_replace("Business Hours", "Ã–ffnungszeiten", replace) ? str_replace("Business Hours", "Ã–ffnungszeiten", replace) : replace;
        replace = str_replace("Closed", "Geschlossen", replace) ? str_replace("Closed", "Geschlossen", replace) : replace;
        replace = str_replace("Coming soon", "Kommt bald", replace) ? str_replace("Coming soon", "Kommt bald", replace) : replace;
        replace = str_replace("List", "AuffÃ¼hren", replace) ? str_replace("List", "AuffÃ¼hren", replace) : replace;
        replace = str_replace("Masonry", "Mauerwerk", replace) ? str_replace("Masonry", "Mauerwerk", replace) : replace;
        replace = str_replace("Grid", "Netz", replace) ? str_replace("Grid", "Netz", replace) : replace;
        replace = str_replace("Carousel", "Karussell", replace) ? str_replace("Carousel", "Karussell", replace) : replace;
        replace = str_replace("Month", "Monat", replace) ? str_replace("Month", "Monat", replace) : replace;
        replace = str_replace("Export Calendar", "Kalender exportieren", replace) ? str_replace("Export Calendar", "Kalender exportieren", replace) : replace;
        replace = str_replace("Search here...", "Suche hier...", replace) ? str_replace("Search here...", "Suche hier...", replace) : replace;
        return replace;
    }
    function getPolishDayMonth(replace) {
        replace = str_replace("January", "StyczeÅ„", replace) ? str_replace("January", "StyczeÅ„", replace) : replace;
        replace = str_replace("February", "Luty", replace) ? str_replace("February", "Luty", replace) : replace;
        replace = str_replace("March", "Marzec", replace) ? str_replace("March", "Marzec", replace) : replace;
        replace = str_replace("April", "KwiecieÅ„", replace) ? str_replace("April", "KwiecieÅ„", replace) : replace;
        replace = str_replace("May", "Maj", replace) ? str_replace("May", "Maj", replace) : replace;
        replace = str_replace("June", "Czerwiec", replace) ? str_replace("June", "Czerwiec", replace) : replace;
        replace = str_replace("July", "Lipiec", replace) ? str_replace("July", "Lipiec", replace) : replace;
        replace = str_replace("August", "SierpieÅ„", replace) ? str_replace("August", "SierpieÅ„", replace) : replace;
        replace = str_replace("September", "WrzesieÅ„", replace) ? str_replace("September", "WrzesieÅ„", replace) : replace;
        replace = str_replace("October", "PaÅºdziernik", replace) ? str_replace("October", "PaÅºdziernik", replace) : replace;
        replace = str_replace("November", "Listopad", replace) ? str_replace("November", "Listopad", replace) : replace;
        replace = str_replace("December", "GrudzieÅ„", replace) ? str_replace("December", "GrudzieÅ„", replace) : replace;
        replace = str_replace("Jan", "Sty", replace) ? str_replace("Jan", "Sty", replace) : replace;
        replace = str_replace("Feb", "Lut", replace) ? str_replace("Feb", "Lut", replace) : replace;
        replace = str_replace("Mar", "Mar", replace) ? str_replace("Mar", "Mar", replace) : replace;
        replace = str_replace("Apr", "Kwi", replace) ? str_replace("Apr", "Kwi", replace) : replace;
        replace = str_replace("May", "Maj", replace) ? str_replace("May", "Maj", replace) : replace;
        replace = str_replace("Jun", "Cze", replace) ? str_replace("Jun", "Cze", replace) : replace;
        replace = str_replace("Jul", "Lip", replace) ? str_replace("Jul", "Lip", replace) : replace;
        replace = str_replace("Aug", "Sie", replace) ? str_replace("Aug", "Sie", replace) : replace;
        replace = str_replace("Sep", "Wrz", replace) ? str_replace("Sep", "Wrz", replace) : replace;
        replace = str_replace("Oct", "PaÅº", replace) ? str_replace("Oct", "PaÅº", replace) : replace;
        replace = str_replace("Nov", "Lis", replace) ? str_replace("Nov", "Lis", replace) : replace;
        replace = str_replace("Dec", "Gru", replace) ? str_replace("Dec", "Gru", replace) : replace;
        replace = str_replace("Sun", "Nie", replace) ? str_replace("Sun", "Nie", replace) : replace;
        replace = str_replace("Mon", "Pon", replace) ? str_replace("Mon", "Pon", replace) : replace;
        replace = str_replace("Tue", "Wto", replace) ? str_replace("Tue", "Wto", replace) : replace;
        replace = str_replace("Wed", "Åšro", replace) ? str_replace("Wed", "Åšro", replace) : replace;
        replace = str_replace("Thu", "Czw", replace) ? str_replace("Thu", "Czw", replace) : replace;
        replace = str_replace("Fri", "PiÄ…", replace) ? str_replace("Fri", "PiÄ…", replace) : replace;
        replace = str_replace("Sat", "Sob", replace) ? str_replace("Sat", "Sob", replace) : replace;
        replace = str_replace("Sunday", "Nie", replace) ? str_replace("Sunday", "Nie", replace) : replace;
        replace = str_replace("Monday", "Pon", replace) ? str_replace("Monday", "Pon", replace) : replace;
        replace = str_replace("Tuesday", "Wto", replace) ? str_replace("Tuesday", "Wto", replace) : replace;
        replace = str_replace("Wednesday", "Åšro", replace) ? str_replace("Wednesday", "Åšro", replace) : replace;
        replace = str_replace("Thursday", "Czw", replace) ? str_replace("Thursday", "Czw", replace) : replace;
        replace = str_replace("Friday", "PiÄ…", replace) ? str_replace("Friday", "PiÄ…", replace) : replace;
        replace = str_replace("Saturday", "Sob", replace) ? str_replace("Saturday", "Sob", replace) : replace;
        replace = str_replace("month ago", "miesiÄ…c temu", replace) ? str_replace("month ago", "miesiÄ…c temu", replace) : replace;
        replace = str_replace("months ago", "miesiÄ…c temu", replace) ? str_replace("months ago", "miesiÄ…c temu", replace) : replace;
        replace = str_replace("Date and time", "Data i godzina", replace) ? str_replace("Date and time", "Data i godzina", replace) : replace;
        replace = str_replace("reviews", "recenzje", replace) ? str_replace("reviews", "recenzje", replace) : replace;
        replace = str_replace("Address", "Adres zamieszkania", replace) ? str_replace("Address", "Adres zamieszkania", replace) : replace;
        replace = str_replace("Website", "Strona internetowa", replace) ? str_replace("Website", "Strona internetowa", replace) : replace;
        replace = str_replace("Phone", "Telefon", replace) ? str_replace("Phone", "Telefon", replace) : replace;
        replace = str_replace("Business Hours", "Godziny pracy", replace) ? str_replace("Business Hours", "Godziny pracy", replace) : replace;
        replace = str_replace("Closed", "ZamkniÄ™te", replace) ? str_replace("Closed", "ZamkniÄ™te", replace) : replace;
        replace = str_replace("Coming soon", "WkrÃ³tce", replace) ? str_replace("Coming soon", "WkrÃ³tce", replace) : replace;
        replace = str_replace("List ", "Lista ", replace) ? str_replace("List ", "Lista ", replace) : replace;
        replace = str_replace("Masonry", "Kamieniarstwo", replace) ? str_replace("Masonry", "Kamieniarstwo", replace) : replace;
        replace = str_replace("Grid", "Siatka", replace) ? str_replace("Grid", "Siatka", replace) : replace;
        replace = str_replace("Carousel", "Karuzela", replace) ? str_replace("Carousel", "Karuzela", replace) : replace;
        replace = str_replace("Month", "MiesiÄ…c", replace) ? str_replace("Month", "MiesiÄ…c", replace) : replace;
        replace = str_replace("Export Calendar", "Eksportuj kalendarz", replace) ? str_replace("Export Calendar", "Eksportuj kalendarz", replace) : replace;
        replace = str_replace("Search here...", "Szukaj tutaj...", replace) ? str_replace("Search here...", "Szukaj tutaj...", replace) : replace;
        return replace;
    }
    function getRussianDayMonth(replace) {
        replace = str_replace("Sunday", "Ð’Ð¡", replace) ? str_replace("Sunday", "Ð’Ð¡", replace) : replace;
        replace = str_replace("Monday", "ÐŸÐ", replace) ? str_replace("Monday", "ÐŸÐ", replace) : replace;
        replace = str_replace("Tuesday", "Ð’Ð¢", replace) ? str_replace("Tuesday", "Ð’Ð¢", replace) : replace;
        replace = str_replace("Wednesday", "Ð¡Ð ", replace) ? str_replace("Wednesday", "Ð¡Ð ", replace) : replace;
        replace = str_replace("Thursday", "Ð§Ð¢", replace) ? str_replace("Thursday", "Ð§Ð¢", replace) : replace;
        replace = str_replace("Friday", "ÐŸÐ¢", replace) ? str_replace("Friday", "ÐŸÐ¢", replace) : replace;
        replace = str_replace("Saturday", "Ð¡Ð‘", replace) ? str_replace("Saturday", "Ð¡Ð‘", replace) : replace;
        replace = str_replace("January", "Ð¯Ð½Ð²", replace) ? str_replace("January", "Ð¯Ð½Ð²", replace) : replace;
        replace = str_replace("February", "Ð¤ÐµÐ²Ñ€", replace) ? str_replace("February", "Ð¤ÐµÐ²Ñ€", replace) : replace;
        replace = str_replace("March", "ÐœÐ°Ñ€Ñ‚", replace) ? str_replace("March", "ÐœÐ°Ñ€Ñ‚", replace) : replace;
        replace = str_replace("April", "ÐÐ¿Ñ€", replace) ? str_replace("April", "ÐÐ¿Ñ€", replace) : replace;
        replace = str_replace("May", "ÐœÐ°Ð¹", replace) ? str_replace("May", "ÐœÐ°Ð¹", replace) : replace;
        replace = str_replace("June", "Ð˜ÑŽÐ½ÑŒ", replace) ? str_replace("June", "Ð˜ÑŽÐ½ÑŒ", replace) : replace;
        replace = str_replace("July", "Ð˜ÑŽÐ»ÑŒ", replace) ? str_replace("July", "Ð˜ÑŽÐ»ÑŒ", replace) : replace;
        replace = str_replace("August", "ÐÐ²Ð³", replace) ? str_replace("August", "ÐÐ²Ð³", replace) : replace;
        replace = str_replace("September", "Ð¡ÐµÐ½Ñ‚", replace) ? str_replace("September", "Ð¡ÐµÐ½Ñ‚", replace) : replace;
        replace = str_replace("October", "ÐžÐºÑ‚Ð±", replace) ? str_replace("October", "ÐžÐºÑ‚Ð±", replace) : replace;
        replace = str_replace("November", "ÐÐ¾ÑÐ±", replace) ? str_replace("November", "ÐÐ¾ÑÐ±", replace) : replace;
        replace = str_replace("December", "Ð”ÐµÐº", replace) ? str_replace("December", "Ð”ÐµÐº", replace) : replace;
        replace = str_replace("month ago", "Ð¼ÐµÑÑÑ† Ð½Ð°Ð·Ð°Ð´", replace) ? str_replace("month ago", "Ð¼ÐµÑÑÑ† Ð½Ð°Ð·Ð°Ð´", replace) : replace;
        replace = str_replace("months ago", "Ð¼ÐµÑÑÑ† Ð½Ð°Ð·Ð°Ð´", replace) ? str_replace("months ago", "Ð¼ÐµÑÑÑ† Ð½Ð°Ð·Ð°Ð´", replace) : replace;
        replace = str_replace("Date and time", "Ð”Ð°Ñ‚Ð° Ð¸ Ð²Ñ€ÐµÐ¼Ñ", replace) ? str_replace("Date and time", "Ð”Ð°Ñ‚Ð° Ð¸ Ð²Ñ€ÐµÐ¼Ñ", replace) : replace;
        replace = str_replace("reviews", "Ð¾Ð±Ð·Ð¾Ñ€Ñ‹", replace) ? str_replace("reviews", "Ð¾Ð±Ð·Ð¾Ñ€Ñ‹", replace) : replace;
        replace = str_replace("Address", "ÐÐ´Ñ€ÐµÑ", replace) ? str_replace("Address", "ÐÐ´Ñ€ÐµÑ", replace) : replace;
        replace = str_replace("Website", "Ð˜Ð½Ñ‚ÐµÑ€Ð½ÐµÑ‚ ÑÐ°Ð¹Ñ‚", replace) ? str_replace("Website", "Ð˜Ð½Ñ‚ÐµÑ€Ð½ÐµÑ‚ ÑÐ°Ð¹Ñ‚", replace) : replace;
        replace = str_replace("Phone", "Ð¢ÐµÐ»ÐµÑ„Ð¾Ð½", replace) ? str_replace("Phone", "Ð¢ÐµÐ»ÐµÑ„Ð¾Ð½", replace) : replace;
        replace = str_replace("Business Hours", "Ð Ð°Ð±Ð¾Ñ‡Ð¸Ðµ Ñ‡Ð°ÑÑ‹", replace) ? str_replace("Business Hours", "Ð Ð°Ð±Ð¾Ñ‡Ð¸Ðµ Ñ‡Ð°ÑÑ‹", replace) : replace;
        replace = str_replace("Closed", "Ð—Ð°ÐºÑ€Ñ‹Ñ‚Ð¾", replace) ? str_replace("Closed", "Ð—Ð°ÐºÑ€Ñ‹Ñ‚Ð¾", replace) : replace;
        replace = str_replace("Coming soon", "Ð¡ÐºÐ¾Ñ€Ð¾ Ð±ÑƒÐ´ÐµÑ‚", replace) ? str_replace("Coming soon", "Ð¡ÐºÐ¾Ñ€Ð¾ Ð±ÑƒÐ´ÐµÑ‚", replace) : replace;
        replace = str_replace("List", "Ð¡Ð¿Ð¸ÑÐ¾Ðº", replace) ? str_replace("List", "Ð¡Ð¿Ð¸ÑÐ¾Ðº", replace) : replace;
        replace = str_replace("Masonry", "ÐšÐ°Ð¼ÐµÐ½Ð½Ð°Ñ ÐºÐ»Ð°Ð´ÐºÐ°", replace) ? str_replace("Masonry", "ÐšÐ°Ð¼ÐµÐ½Ð½Ð°Ñ ÐºÐ»Ð°Ð´ÐºÐ°", replace) : replace;
        replace = str_replace("Grid", "Ð¡ÐµÑ‚ÐºÐ°", replace) ? str_replace("Grid", "Ð¡ÐµÑ‚ÐºÐ°", replace) : replace;
        replace = str_replace("Carousel", "ÐšÐ°Ñ€ÑƒÑÐµÐ»ÑŒ", replace) ? str_replace("Carousel", "ÐšÐ°Ñ€ÑƒÑÐµÐ»ÑŒ", replace) : replace;
        replace = str_replace("Month", "ÐœÐµÑÑÑ†", replace) ? str_replace("Month", "ÐœÐµÑÑÑ†", replace) : replace;
        replace = str_replace("Export Calendar", "Ð­ÐºÑÐ¿Ð¾Ñ€Ñ‚ ÐºÐ°Ð»ÐµÐ½Ð´Ð°Ñ€Ñ", replace) ? str_replace("Export Calendar", "Ð­ÐºÑÐ¿Ð¾Ñ€Ñ‚ ÐºÐ°Ð»ÐµÐ½Ð´Ð°Ñ€Ñ", replace) : replace;
        replace = str_replace("Search here...", "ÐŸÐ¾Ð¸Ñ‰Ð¸ Ð·Ð´ÐµÑÑŒ...", replace) ? str_replace("Search here...", "ÐŸÐ¾Ð¸Ñ‰Ð¸ Ð·Ð´ÐµÑÑŒ...", replace) : replace;
        return replace;
    }
    function getFaroeseDayMonth(replace) {
        replace = str_replace("Sunday", "Sunday", replace) ? str_replace("Sunday", "Sunday", replace) : replace;
        replace = str_replace("Monday", "MÃ¡n", replace) ? str_replace("Monday", "MÃ¡n", replace) : replace;
        replace = str_replace("Tuesday", "TÃ½s", replace) ? str_replace("Tuesday", "TÃ½s", replace) : replace;
        replace = str_replace("Wednesday", "Mik", replace) ? str_replace("Wednesday", "Mik", replace) : replace;
        replace = str_replace("Thursday", "HÃ³s", replace) ? str_replace("Thursday", "HÃ³s", replace) : replace;
        replace = str_replace("Friday", "FrÃ­", replace) ? str_replace("Friday", "FrÃ­", replace) : replace;
        replace = str_replace("Saturday", "Ley", replace) ? str_replace("Saturday", "Ley", replace) : replace;
        replace = str_replace("January", "January", replace) ? str_replace("January", "January", replace) : replace;
        replace = str_replace("February", "February", replace) ? str_replace("February", "February", replace) : replace;
        replace = str_replace("March", "March", replace) ? str_replace("March", "March", replace) : replace;
        replace = str_replace("April", "April", replace) ? str_replace("April", "April", replace) : replace;
        replace = str_replace("May", "Mai", replace) ? str_replace("May", "Mai", replace) : replace;
        replace = str_replace("June", "June", replace) ? str_replace("June", "June", replace) : replace;
        replace = str_replace("July", "July", replace) ? str_replace("July", "July", replace) : replace;
        replace = str_replace("August", "August", replace) ? str_replace("August", "August", replace) : replace;
        replace = str_replace("September", "September", replace) ? str_replace("September", "September", replace) : replace;
        replace = str_replace("October", "Okt", replace) ? str_replace("October", "Okt", replace) : replace;
        replace = str_replace("November", "November", replace) ? str_replace("November", "November", replace) : replace;
        replace = str_replace("December", "Des", replace) ? str_replace("December", "Des", replace) : replace;
        return replace;
    }
    function getPortugueseDayMonth(replace) {
        replace = str_replace("Sunday", "Dom", replace) ? str_replace("Sunday", "Dom", replace) : replace;
        replace = str_replace("Monday", "Seg", replace) ? str_replace("Monday", "Seg", replace) : replace;
        replace = str_replace("Tuesday", "Ter", replace) ? str_replace("Tuesday", "Ter", replace) : replace;
        replace = str_replace("Wednesday", "Qua", replace) ? str_replace("Wednesday", "Qua", replace) : replace;
        replace = str_replace("Thursday", "Qui", replace) ? str_replace("Thursday", "Qui", replace) : replace;
        replace = str_replace("Friday", "Sex", replace) ? str_replace("Friday", "Sex", replace) : replace;
        replace = str_replace("Saturday", "SÃ¡b", replace) ? str_replace("Saturday", "SÃ¡b", replace) : replace;
        replace = str_replace("January", "January", replace) ? str_replace("January", "January", replace) : replace;
        replace = str_replace("February", "Fev", replace) ? str_replace("February", "Fev", replace) : replace;
        replace = str_replace("March", "March", replace) ? str_replace("March", "March", replace) : replace;
        replace = str_replace("April", "Abr", replace) ? str_replace("April", "Abr", replace) : replace;
        replace = str_replace("May", "Mai", replace) ? str_replace("May", "Mai", replace) : replace;
        replace = str_replace("June", "June", replace) ? str_replace("June", "June", replace) : replace;
        replace = str_replace("July", "July", replace) ? str_replace("July", "July", replace) : replace;
        replace = str_replace("August", "Ago", replace) ? str_replace("August", "Ago", replace) : replace;
        replace = str_replace("September", "Set", replace) ? str_replace("September", "Set", replace) : replace;
        replace = str_replace("October", "Out", replace) ? str_replace("October", "Out", replace) : replace;
        replace = str_replace("November", "November", replace) ? str_replace("November", "November", replace) : replace;
        replace = str_replace("December", "Dez", replace) ? str_replace("December", "Dez", replace) : replace;
        replace = str_replace("month ago", "mÃªs atrÃ¡s", replace) ? str_replace("month ago", "mÃªs atrÃ¡s", replace) : replace;
        replace = str_replace("months ago", "mÃªs atrÃ¡s", replace) ? str_replace("months ago", "mÃªs atrÃ¡s", replace) : replace;
        replace = str_replace("Date and time", "Data e hora", replace) ? str_replace("Date and time", "Data e hora", replace) : replace;
        replace = str_replace("reviews", "avaliaÃ§Ãµes", replace) ? str_replace("reviews", "avaliaÃ§Ãµes", replace) : replace;
        replace = str_replace("Address", "EndereÃ§o", replace) ? str_replace("Address", "EndereÃ§o", replace) : replace;
        replace = str_replace("Website", "Local na rede Internet", replace) ? str_replace("Website", "Local na rede Internet", replace) : replace;
        replace = str_replace("Phone", "Telefone", replace) ? str_replace("Phone", "Telefone", replace) : replace;
        replace = str_replace("Business Hours", "HorÃ¡rio Comercial", replace) ? str_replace("Business Hours", "HorÃ¡rio Comercial", replace) : replace;
        replace = str_replace("Closed", "Fechadas", replace) ? str_replace("Closed", "Fechadas", replace) : replace;
        replace = str_replace("Coming soon", "Em breve", replace) ? str_replace("Coming soon", "Em breve", replace) : replace;
        replace = str_replace("List", "Lista", replace) ? str_replace("List", "Lista", replace) : replace;
        replace = str_replace("Masonry", "Alvenaria", replace) ? str_replace("Masonry", "Alvenaria", replace) : replace;
        replace = str_replace("Grid", "Grade", replace) ? str_replace("Grid", "Grade", replace) : replace;
        replace = str_replace("Carousel", "Carrossel", replace) ? str_replace("Carousel", "Carrossel", replace) : replace;
        replace = str_replace("Month", "MÃªs", replace) ? str_replace("Month", "MÃªs", replace) : replace;
        replace = str_replace("Export Calendar", "Exportar CalendÃ¡rio", replace) ? str_replace("Export Calendar", "Exportar CalendÃ¡rio", replace) : replace;
        replace = str_replace("Search here...", "Procure aqui...", replace) ? str_replace("Search here...", "Procure aqui...", replace) : replace;
        return replace;
    }
    function getDanishDayMonth(replace) {
        replace = str_replace("Sunday", "SÃ¸n", replace) ? str_replace("Sunday", "SÃ¸n", replace) : replace;
        replace = str_replace("Monday", "Man", replace) ? str_replace("Monday", "Man", replace) : replace;
        replace = str_replace("Tuesday", "Tir", replace) ? str_replace("Tuesday", "Tir", replace) : replace;
        replace = str_replace("Wednesday", "Ons", replace) ? str_replace("Wednesday", "Ons", replace) : replace;
        replace = str_replace("Thursday", "Tor", replace) ? str_replace("Thursday", "Tor", replace) : replace;
        replace = str_replace("Friday", "Fre", replace) ? str_replace("Friday", "Fre", replace) : replace;
        replace = str_replace("Saturday", "LÃ¸r", replace) ? str_replace("Saturday", "LÃ¸r", replace) : replace;
        replace = str_replace("January", "January", replace) ? str_replace("January", "January", replace) : replace;
        replace = str_replace("February", "February", replace) ? str_replace("February", "February", replace) : replace;
        replace = str_replace("March", "March", replace) ? str_replace("March", "March", replace) : replace;
        replace = str_replace("April", "April", replace) ? str_replace("April", "April", replace) : replace;
        replace = str_replace("May", "Maj", replace) ? str_replace("May", "Maj", replace) : replace;
        replace = str_replace("June", "June", replace) ? str_replace("June", "June", replace) : replace;
        replace = str_replace("July", "July", replace) ? str_replace("July", "July", replace) : replace;
        replace = str_replace("August", "August", replace) ? str_replace("August", "August", replace) : replace;
        replace = str_replace("September", "September", replace) ? str_replace("September", "Sep", replace) : replace;
        replace = str_replace("October", "Okt", replace) ? str_replace("October", "Okt", replace) : replace;
        replace = str_replace("November", "November", replace) ? str_replace("November", "November", replace) : replace;
        replace = str_replace("December", "December", replace) ? str_replace("December", "December", replace) : replace;
        replace = str_replace("month ago", "mÃ¥ned siden", replace) ? str_replace("month ago", "mÃ¥ned siden", replace) : replace;
        replace = str_replace("months ago", "mÃ¥ned siden", replace) ? str_replace("months ago", "mÃ¥ned siden", replace) : replace;
        replace = str_replace("Date and time", "Dato og tid", replace) ? str_replace("Date and time", "Dato og tid", replace) : replace;
        replace = str_replace("reviews", "anmeldelser", replace) ? str_replace("reviews", "anmeldelser", replace) : replace;
        replace = str_replace("Address", "Adresse", replace) ? str_replace("Address", "Adresse", replace) : replace;
        replace = str_replace("Website", "Internet side", replace) ? str_replace("Website", "Internet side", replace) : replace;
        replace = str_replace("Phone", "telefon", replace) ? str_replace("Phone", "telefon", replace) : replace;
        replace = str_replace("Business Hours", "Arbejdstimer", replace) ? str_replace("Business Hours", "Arbejdstimer", replace) : replace;
        replace = str_replace("Closed", "Lukket", replace) ? str_replace("Closed", "Lukket", replace) : replace;
        replace = str_replace("Coming soon", "Kommer snart", replace) ? str_replace("Coming soon", "Kommer snart", replace) : replace;
        replace = str_replace("List", "Liste", replace) ? str_replace("List", "Liste", replace) : replace;
        replace = str_replace("Masonry", "MurvÃ¦rk", replace) ? str_replace("Masonry", "MurvÃ¦rk", replace) : replace;
        replace = str_replace("Grid", "Gitter", replace) ? str_replace("Grid", "Gitter", replace) : replace;
        replace = str_replace("Carousel", "Karrusel", replace) ? str_replace("Carousel", "Karrusel", replace) : replace;
        replace = str_replace("Month", "MÃ¥ned", replace) ? str_replace("Month", "MÃ¥ned", replace) : replace;
        replace = str_replace("Export Calendar", "Eksporter kalender", replace) ? str_replace("Export Calendar", "Eksporter kalender", replace) : replace;
        replace = str_replace("Search here...", "SÃ¸g her...", replace) ? str_replace("Search here...", "SÃ¸g her...", replace) : replace;
        return replace;
    }
    function getDutchDayMonth(replace) {
        replace = str_replace("Sunday", "Zondag", replace) ? str_replace("Sunday", "Zondag", replace) : replace;
        replace = str_replace("Monday", "Maandag", replace) ? str_replace("Monday", "Maandag", replace) : replace;
        replace = str_replace("Tuesday", "Dinsdag", replace) ? str_replace("Tuesday", "Dinsdag", replace) : replace;
        replace = str_replace("Wednesday", "Woensdag", replace) ? str_replace("Wednesday", "Woensdag", replace) : replace;
        replace = str_replace("Thursday", "Donderdag", replace) ? str_replace("Thursday", "Donderdag", replace) : replace;
        replace = str_replace("Friday", "Vrijdag", replace) ? str_replace("Friday", "Vrijdag", replace) : replace;
        replace = str_replace("Saturday", "Zaterdag", replace) ? str_replace("Saturday", "Zaterdag", replace) : replace;
        replace = str_replace("January", "januari", replace) ? str_replace("January", "januari", replace) : replace;
        replace = str_replace("February", "februari", replace) ? str_replace("February", "februari", replace) : replace;
        replace = str_replace("March", "maart", replace) ? str_replace("March", "maart", replace) : replace;
        replace = str_replace("April", "april", replace) ? str_replace("April", "april", replace) : replace;
        replace = str_replace("May", "mei", replace) ? str_replace("May", "mei", replace) : replace;
        replace = str_replace("June", "juni", replace) ? str_replace("June", "juni", replace) : replace;
        replace = str_replace("July", "juli", replace) ? str_replace("July", "juli", replace) : replace;
        replace = str_replace("August", "augustus", replace) ? str_replace("August", "augustus", replace) : replace;
        replace = str_replace("September", "september", replace) ? str_replace("September", "september", replace) : replace;
        replace = str_replace("October", "oktober", replace) ? str_replace("October", "oktober", replace) : replace;
        replace = str_replace("November", "november", replace) ? str_replace("November", "november", replace) : replace;
        replace = str_replace("December", "december", replace) ? str_replace("December", "december", replace) : replace;
        replace = str_replace("month ago", "maand geleden", replace) ? str_replace("month ago", "maand geleden", replace) : replace;
        replace = str_replace("months ago", "maand geleden", replace) ? str_replace("months ago", "maand geleden", replace) : replace;
        replace = str_replace("Date and time", "Datum en tijd", replace) ? str_replace("Date and time", "Datum en tijd", replace) : replace;
        replace = str_replace("reviews", "recensies", replace) ? str_replace("reviews", "recensies", replace) : replace;
        replace = str_replace("Address", "Adres", replace) ? str_replace("Address", "Adres", replace) : replace;
        replace = str_replace("Website", "Website", replace) ? str_replace("Website", "Website", replace) : replace;
        replace = str_replace("Phone", "Telefoon", replace) ? str_replace("Phone", "Telefoon", replace) : replace;
        replace = str_replace("Business Hours", "Openingstijden", replace) ? str_replace("Business Hours", "Openingstijden", replace) : replace;
        replace = str_replace("Closed", "Gesloten", replace) ? str_replace("Closed", "Gesloten", replace) : replace;
        replace = str_replace("Coming soon", "Binnenkort beschikbaar", replace) ? str_replace("Coming soon", "Binnenkort beschikbaar", replace) : replace;
        replace = str_replace("List", "Lijst", replace) ? str_replace("List", "Lijst", replace) : replace;
        replace = str_replace("Masonry", "Metselwerk", replace) ? str_replace("Masonry", "Metselwerk", replace) : replace;
        replace = str_replace("Grid", "Rooster", replace) ? str_replace("Grid", "Rooster", replace) : replace;
        replace = str_replace("Carousel", "Carrousel", replace) ? str_replace("Carousel", "Carrousel", replace) : replace;
        replace = str_replace("Month", "Maand", replace) ? str_replace("Month", "Maand", replace) : replace;
        replace = str_replace("Export Calendar", "Kalender exporteren", replace) ? str_replace("Export Calendar", "Kalender exporteren", replace) : replace;
        replace = str_replace("Search here...", "Zoek hier...", replace) ? str_replace("Search here...", "Zoek hier...", replace) : replace;
        return replace;
    }
    function getFinnishDayMonth(replace) {
        replace = str_replace("Sunday", "Sunnuntai", replace) ? str_replace("Sunday", "Sunnuntai", replace) : replace;
        replace = str_replace("Monday", "Maanantai", replace) ? str_replace("Monday", "Maanantai", replace) : replace;
        replace = str_replace("Tuesday", "Tiistai", replace) ? str_replace("Tuesday", "Tiistai", replace) : replace;
        replace = str_replace("Wednesday", "Keskiviikko", replace) ? str_replace("Wednesday", "Keskiviikko", replace) : replace;
        replace = str_replace("Thursday", "Torstai", replace) ? str_replace("Thursday", "Torstai", replace) : replace;
        replace = str_replace("Friday", "Perjantai", replace) ? str_replace("Friday", "Perjantai", replace) : replace;
        replace = str_replace("Saturday", "Lauantai", replace) ? str_replace("Saturday", "Lauantai", replace) : replace;
        replace = str_replace("January", "Tammikuu", replace) ? str_replace("January", "Tammikuu", replace) : replace;
        replace = str_replace("February", "Helmikuu", replace) ? str_replace("February", "Helmikuu", replace) : replace;
        replace = str_replace("March", "Maaliskuu", replace) ? str_replace("March", "Maaliskuu", replace) : replace;
        replace = str_replace("April", "Huhtikuu", replace) ? str_replace("April", "Huhtikuu", replace) : replace;
        replace = str_replace("May", "Toukokuu", replace) ? str_replace("May", "Toukokuu", replace) : replace;
        replace = str_replace("June", "KesÃ¤kuu", replace) ? str_replace("June", "KesÃ¤kuu", replace) : replace;
        replace = str_replace("July", "HeinÃ¤kuu", replace) ? str_replace("July", "HeinÃ¤kuu", replace) : replace;
        replace = str_replace("August", "Elokuu", replace) ? str_replace("August", "Elokuu", replace) : replace;
        replace = str_replace("September", "Syyskuu", replace) ? str_replace("September", "Syyskuu", replace) : replace;
        replace = str_replace("October", "Lokakuu", replace) ? str_replace("October", "Lokakuu", replace) : replace;
        replace = str_replace("November", "Marraskuu", replace) ? str_replace("November", "Marraskuu", replace) : replace;
        replace = str_replace("December", "Joulukuu", replace) ? str_replace("December", "Joulukuu", replace) : replace;
        replace = str_replace("month ago", "kuukausi sitten", replace) ? str_replace("month ago", "kuukausi sitten", replace) : replace;
        replace = str_replace("months ago", "kuukausia sitten", replace) ? str_replace("months ago", "kuukausia sitten", replace) : replace;
        replace = str_replace("Date and time", "PÃ¤ivÃ¤mÃ¤Ã¤rÃ¤ ja aika", replace) ? str_replace("Date and time", "PÃ¤ivÃ¤mÃ¤Ã¤rÃ¤ ja aika", replace) : replace;
        replace = str_replace("reviews", "Arvostelut", replace) ? str_replace("reviews", "Arvostelut", replace) : replace;
        replace = str_replace("Address", "Osoite", replace) ? str_replace("Address", "Osoite", replace) : replace;
        replace = str_replace("Website", "Verkkosivusto", replace) ? str_replace("Website", "Verkkosivusto", replace) : replace;
        replace = str_replace("Phone", "Puhelin", replace) ? str_replace("Phone", "Puhelin", replace) : replace;
        replace = str_replace("Business Hours", "PracovnÃ© hodiny", replace) ? str_replace("Business Hours", "PracovnÃ© hodiny", replace) : replace;
        replace = str_replace("Closed", "Suljettu", replace) ? str_replace("Closed", "Suljettu", replace) : replace;
        replace = str_replace("Coming soon", "Tulossa pian", replace) ? str_replace("Coming soon", "Tulossa pian", replace) : replace;
        replace = str_replace("List", "Lista", replace) ? str_replace("List", "Lista", replace) : replace;
        replace = str_replace("Masonry", "Muuraus", replace) ? str_replace("Masonry", "Muuraus", replace) : replace;
        replace = str_replace("Grid", "Ruudukko", replace) ? str_replace("Grid", "Ruudukko", replace) : replace;
        replace = str_replace("Carousel", "Karuselli", replace) ? str_replace("Carousel", "Karuselli", replace) : replace;
        replace = str_replace("Month", "Kuukausi", replace) ? str_replace("Month", "Kuukausi", replace) : replace;
        replace = str_replace("Export Calendar", "Vie kalenteri", replace) ? str_replace("Export Calendar", "Vie kalenteri", replace) : replace;
        replace = str_replace("Search here...", "Etsi tÃ¤Ã¤ltÃ¤...", replace) ? str_replace("Search here...", "Etsi tÃ¤Ã¤ltÃ¤...", replace) : replace;
        return replace;
    }
    function getSlovakDayMonth(replace) {
        replace = str_replace("Sunday", "NedeÄ¾a", replace) ? str_replace("Sunday", "NedeÄ¾a", replace) : replace;
        replace = str_replace("Monday", "Pondelok", replace) ? str_replace("Monday", "Pondelok", replace) : replace;
        replace = str_replace("Tuesday", "Utorok", replace) ? str_replace("Tuesday", "Utorok", replace) : replace;
        replace = str_replace("Wednesday", "Streda", replace) ? str_replace("Wednesday", "Streda", replace) : replace;
        replace = str_replace("Thursday", "Å tvrtok", replace) ? str_replace("Thursday", "Å tvrtok", replace) : replace;
        replace = str_replace("Friday", "Piatok", replace) ? str_replace("Friday", "Piatok", replace) : replace;
        replace = str_replace("Saturday", "Sobota", replace) ? str_replace("Saturday", "Sobota", replace) : replace;
        replace = str_replace("January", "Jan", replace) ? str_replace("January", "Jan", replace) : replace;
        replace = str_replace("February", "Feb", replace) ? str_replace("February", "Feb", replace) : replace;
        replace = str_replace("March", "Mar", replace) ? str_replace("March", "Mar", replace) : replace;
        replace = str_replace("April", "Apr", replace) ? str_replace("April", "Apr", replace) : replace;
        replace = str_replace("May", "MÃ¡j", replace) ? str_replace("May", "MÃ¡j", replace) : replace;
        replace = str_replace("June", "JÃºn", replace) ? str_replace("June", "JÃºn", replace) : replace;
        replace = str_replace("July", "JÃºl", replace) ? str_replace("July", "JÃºl", replace) : replace;
        replace = str_replace("August", "Aug", replace) ? str_replace("August", "Aug", replace) : replace;
        replace = str_replace("September", "Sep", replace) ? str_replace("September", "Sep", replace) : replace;
        replace = str_replace("October", "Okt", replace) ? str_replace("October", "Okt", replace) : replace;
        replace = str_replace("November", "Nov", replace) ? str_replace("November", "Nov", replace) : replace;
        replace = str_replace("December", "Dec", replace) ? str_replace("December", "Dec", replace) : replace;
        replace = str_replace("month ago", "pred mesiacom", replace) ? str_replace("month ago", "pred mesiacom", replace) : replace;
        replace = str_replace("months ago", "pred mesiacom", replace) ? str_replace("months ago", "pred mesiacom", replace) : replace;
        replace = str_replace("Date and time", "DÃ¡tum a Äas", replace) ? str_replace("Date and time", "DÃ¡tum a Äas", replace) : replace;
        replace = str_replace("reviews", "recenzie", replace) ? str_replace("reviews", "recenzie", replace) : replace;
        replace = str_replace("Address", "Adresa", replace) ? str_replace("Address", "Adresa", replace) : replace;
        replace = str_replace("Website", "WebovÃ¡ strÃ¡nka", replace) ? str_replace("Website", "WebovÃ¡ strÃ¡nka", replace) : replace;
        replace = str_replace("Phone", "TelefÃ³n", replace) ? str_replace("Phone", "TelefÃ³n", replace) : replace;
        replace = str_replace("Business Hours", "PracovnÃ© hodiny", replace) ? str_replace("Business Hours", "PracovnÃ© hodiny", replace) : replace;
        replace = str_replace("Closed", "ZATVORENÃ‰", replace) ? str_replace("Closed", "ZATVORENÃ‰", replace) : replace;
        replace = str_replace("Coming soon", "UÅ¾ Äoskoro", replace) ? str_replace("Coming soon", "UÅ¾ Äoskoro", replace) : replace;
        replace = str_replace("List", "Zoznam", replace) ? str_replace("List", "Zoznam", replace) : replace;
        replace = str_replace("Masonry", "MurÃ¡rstvo", replace) ? str_replace("Masonry", "MurÃ¡rstvo", replace) : replace;
        replace = str_replace("Grid", "MrieÅ¾ka", replace) ? str_replace("Grid", "MrieÅ¾ka", replace) : replace;
        replace = str_replace("Carousel", "KolotoÄ", replace) ? str_replace("Carousel", "KolotoÄ", replace) : replace;
        replace = str_replace("Month", "Mesiac", replace) ? str_replace("Month", "Mesiac", replace) : replace;
        replace = str_replace("Export Calendar", "ExportovaÅ¥ kalendÃ¡r", replace) ? str_replace("Export Calendar", "ExportovaÅ¥ kalendÃ¡r", replace) : replace;
        replace = str_replace("Search here...", "HÄ¾adaj tu...", replace) ? str_replace("Search here...", "HÄ¾adaj tu...", replace) : replace;
        return replace;
    }
    function getTurkishDayMonth(replace) {
        replace = str_replace("Sunday", "Pazar", replace) ? str_replace("Sunday", "Pazar", replace) : replace;
        replace = str_replace("Monday", "Pazartesi", replace) ? str_replace("Monday", "Pazartesi", replace) : replace;
        replace = str_replace("Tuesday", "SalÄ±", replace) ? str_replace("Tuesday", "SalÄ±", replace) : replace;
        replace = str_replace("Wednesday", "Ã‡arÅŸamba", replace) ? str_replace("Wednesday", "Ã‡arÅŸamba", replace) : replace;
        replace = str_replace("Thursday", "PerÅŸembe", replace) ? str_replace("Thursday", "PerÅŸembe", replace) : replace;
        replace = str_replace("Friday", "Cuma", replace) ? str_replace("Friday", "Cuma", replace) : replace;
        replace = str_replace("Saturday", "Cumartesi", replace) ? str_replace("Saturday", "Cumartesi", replace) : replace;
        replace = str_replace("January", "Ocak", replace) ? str_replace("January", "Ocak", replace) : replace;
        replace = str_replace("February", "Åžubat", replace) ? str_replace("February", "Åžubat", replace) : replace;
        replace = str_replace("March", "Mart", replace) ? str_replace("March", "Mart", replace) : replace;
        replace = str_replace("April", "Nisan", replace) ? str_replace("April", "Nisan", replace) : replace;
        replace = str_replace("May", "MayÄ±s", replace) ? str_replace("May", "MayÄ±s", replace) : replace;
        replace = str_replace("June", "Haziran", replace) ? str_replace("June", "Haziran", replace) : replace;
        replace = str_replace("July", "Temmuz", replace) ? str_replace("July", "Temmuz", replace) : replace;
        replace = str_replace("August", "AÄŸustos", replace) ? str_replace("August", "AÄŸustos", replace) : replace;
        replace = str_replace("September", "EylÃ¼l", replace) ? str_replace("September", "EylÃ¼l", replace) : replace;
        replace = str_replace("October", "Ekim", replace) ? str_replace("October", "Ekim", replace) : replace;
        replace = str_replace("November", "KasÄ±m", replace) ? str_replace("November", "KasÄ±m", replace) : replace;
        replace = str_replace("December", "AralÄ±k", replace) ? str_replace("December", "AralÄ±k", replace) : replace;
        replace = str_replace("reviews", "yorumlar", replace) ? str_replace("reviews", "yorumlar", replace) : replace;
        replace = str_replace("Address", "Adres", replace) ? str_replace("Address", "Adres", replace) : replace;
        replace = str_replace("Website", "Web Sitesi", replace) ? str_replace("Website", "Web Sitesi", replace) : replace;
        replace = str_replace("Phone", "Telefon", replace) ? str_replace("Phone", "Telefon", replace) : replace;
        replace = str_replace("Business Hours", "Ã‡alÄ±ÅŸma Saatleri", replace) ? str_replace("Business Hours", "Ã‡alÄ±ÅŸma Saatleri", replace) : replace;
        replace = str_replace("Closed", "KapalÄ±", replace) ? str_replace("Closed", "KapalÄ±", replace) : replace;
        replace = str_replace("Coming soon", "YakÄ±nda", replace) ? str_replace("Coming soon", "YakÄ±nda", replace) : replace;
        replace = str_replace("List", "Liste", replace) ? str_replace("List", "Liste", replace) : replace;
        replace = str_replace("Masonry", "TaÅŸ iÅŸÃ§iliÄŸi", replace) ? str_replace("Masonry", "TaÅŸ iÅŸÃ§iliÄŸi", replace) : replace;
        replace = str_replace("Grid", "Izgara", replace) ? str_replace("Grid", "Izgara", replace) : replace;
        replace = str_replace("Carousel", "Karusel", replace) ? str_replace("Carousel", "Karusel", replace) : replace;
        replace = str_replace("Month", "Ay", replace) ? str_replace("Month", "Ay", replace) : replace;
        replace = str_replace("Export Calendar", "Takvimi DÄ±ÅŸa Aktar", replace) ? str_replace("Export Calendar", "Takvimi DÄ±ÅŸa Aktar", replace) : replace;
        replace = str_replace("Search here...", "Burada ara...", replace) ? str_replace("Search here...", "Burada ara...", replace) : replace;
        replace = str_replace("second ago", "bir saniye Ã¶nce", replace) ? str_replace("second ago", "bir saniye Ã¶nce", replace) : replace;
        replace = str_replace("seconds ago", "saniyeler Ã¶nce", replace) ? str_replace("seconds ago", "saniyeler Ã¶nce", replace) : replace;
        replace = str_replace("minute ago", "bir dakika Ã¶nce", replace) ? str_replace("minute ago", "bir dakika Ã¶nce", replace) : replace;
        replace = str_replace("minutes ago", "dakikalar Ã¶nce", replace) ? str_replace("minutes ago", "dakikalar Ã¶nce", replace) : replace;
        replace = str_replace("hour ago", "bir saat Ã¶nce", replace) ? str_replace("hour ago", "bir saat Ã¶nce", replace) : replace;
        replace = str_replace("hours ago", "saatler Ã¶nce", replace) ? str_replace("hours ago", "saatler Ã¶nce", replace) : replace;
        replace = str_replace("month ago", "bir ay Ã¶nce", replace) ? str_replace("month ago", "bir ay Ã¶nce", replace) : replace;
        replace = str_replace("months ago", "aylar Ã¶nce", replace) ? str_replace("months ago", "aylar Ã¶nce", replace) : replace;
        replace = str_replace("day ago", "bir gÃ¼n Ã¶nce", replace) ? str_replace("day ago", "bir gÃ¼n Ã¶nce", replace) : replace;
        replace = str_replace("days ago", "gÃ¼nler Ã¶nce", replace) ? str_replace("days ago", "gÃ¼nler Ã¶nce", replace) : replace;
        replace = str_replace("year ago", "bir yÄ±l Ã¶nce", replace) ? str_replace("year ago", "bir yÄ±l Ã¶nce", replace) : replace;
        replace = str_replace("years ago", "yÄ±llar Ã¶nce", replace) ? str_replace("years ago", "yÄ±llar Ã¶nce", replace) : replace;
        return replace;
    }
    function str_replace(to_replace, replacement, original) {
        var res = original;
        if (res) {
            res = res.split(to_replace).join(replacement);
        }
        return res;
    }
    function makeFullMonthName(replace) {
        replace = str_replace("Jan ", "January ", replace);
        replace = str_replace("JAN ", "January ", replace);
        replace = str_replace("Feb ", "February ", replace);
        replace = str_replace("FEB ", "February ", replace);
        replace = str_replace("Mar ", "March ", replace);
        replace = str_replace("MAR ", "March ", replace);
        replace = str_replace("Apr ", "April ", replace);
        replace = str_replace("APR ", "April ", replace);
        replace = str_replace("May ", "May ", replace);
        replace = str_replace("MAY ", "May ", replace);
        replace = str_replace("Jun ", "June ", replace);
        replace = str_replace("JUN ", "June ", replace);
        replace = str_replace("Jul ", "July ", replace);
        replace = str_replace("JUL ", "July ", replace);
        replace = str_replace("Aug ", "August ", replace);
        replace = str_replace("AUG ", "August ", replace);
        replace = str_replace("Sep ", "September ", replace);
        replace = str_replace("SEP ", "September ", replace);
        replace = str_replace("Oct ", "October ", replace);
        replace = str_replace("OCT ", "October ", replace);
        replace = str_replace("Nov ", "November ", replace);
        replace = str_replace("NOV ", "November ", replace);
        replace = str_replace("Dec ", "December ", replace);
        replace = str_replace("DEC ", "December ", replace);
        return replace;
    }
    function languageCode(translation) {
        var locale = "";
        if (translation == "Spanish") {
            locale = "es";
        }
        if (translation == "Croatian") {
            locale = "hr";
        }
        if (translation == "Norwegian") {
            locale = "no";
        }
        if (translation == "Swedish") {
            locale = "sv";
        }
        if (translation == "Filipino") {
            locale = "";
        }
        if (translation == "French") {
            locale = "fr";
        }
        if (translation == "German") {
            locale = "";
        }
        if (translation == "Polish") {
            locale = "";
        }
        if (translation == "Russian") {
            locale = "ru";
        }
        if (translation == "Faroese") {
            locale = "fo";
        }
        if (translation == "Portuguese") {
            locale = "pt";
        }
        if (translation == "Danish") {
            locale = "da";
        }
        if (translation == "Dutch") {
            locale = "nl";
        }
        if (translation == "Hungarian") {
            locale = "hu";
        }
        if (translation == "German") {
            locale = "de";
        }
        if (translation == "Italian") {
            locale = "it";
        }
        return locale;
    }
    function main() {
        function loadSettingsData(sk_google_reviews, json_settings_url, json_feed_url) {
            fetch(json_feed_url, {
                method: 'get'
            }).then(function(response) {
                if (!response.ok) {
                    loadSettingsData(sk_google_reviews, json_settings_url, json_settings_url)
                    return;
                }
                response.json().then(function(data) {
                    if (window.location.href.includes('66348024067')) {
                        sk_google_reviews.parent('div').width(jQuery('body').width());
                    }
                    var settings_data = data;
                    original_data = data;
                    if (data.settings) {
                        settings_data = data.settings;
                        settings_data.type = 22;
                    }
                    if (!settings_data.type) {
                        loadSettingsData(sk_google_reviews, json_settings_url, json_settings_url)
                        return;
                    }
                    settings_data.type = 22;
                    var web_safe_fonts = ["Inherit", "Impact, Charcoal, sans-serif", "'Palatino Linotype', 'Book Antiqua', Palatino, serif", "Century Gothic, sans-serif", "'Lucida Sans Unicode', 'Lucida Grande', sans-serif", "Verdana, Geneva, sans-serif", "Copperplate, 'Copperplate Gothic Light', fantasy", "'Courier New', Courier, monospace", "Georgia, Serif"];
                    var is_font_included = web_safe_fonts.indexOf(settings_data.font_family);
                    if (is_font_included < 0) {
                        loadCssFile("https://fonts.googleapis.com/css?family=" + settings_data.font_family);
                    }
                    if (settings_data.show_feed == false) {
                        sk_google_reviews.find('.loading-img').hide();
                        sk_google_reviews.prepend(settings_data.message);
                    } else {
                        var settings_html = "";
                        settings_html += "<div class='display-none sk-settings' style='display:none;'>";
                        jQuery.each(settings_data, function(key, value) {
                            settings_html += "<div class='" + key + "'>" + value + "</div>";
                        });
                        settings_html += "</div>";
                        if (sk_google_reviews.find('.sk-settings').length) {} else {
                            sk_google_reviews.prepend(settings_html);
                        }
                        if (getDsmSetting(sk_google_reviews, 'layout') == 3) {
                            loadCssFile(app_url + "libs/swiper/swiper.min.css");
                            loadCssFile(app_url + "libs/swiper/swiper.css?v=ranndomchars");
                        }
                        if (data.css) {
                            jQuery('head').append('<style type="text/css">' + data.css + '</style>');
                        } else {
                            var sk_version = settings_data.sk_version ? settings_data.sk_version : 1.0;
                            loadCssFile(app_url + "google-reviews/styles.css?v=" + sk_version);
                        }
                        settings_html = "";
                        if (getDsmSetting(sk_google_reviews, 'layout') == 3) {
                            let smooth_carousel_movement = getDsmSetting(sk_google_reviews, "smooth_carousel_movement");
                            if (smooth_carousel_movement && getDsmSetting(sk_google_reviews, "autoplay") == 1) {
                                smooth_carousel_movement = 1;
                            } else {
                                smooth_carousel_movement = 0;
                            }
                            sk_google_reviews.find('div.smooth_carousel_movement').text(smooth_carousel_movement);
                            if (getDsmSetting(sk_google_reviews, 'smooth_carousel_movement') == 1 && getDsmSetting(sk_google_reviews, "autoplay") == 1) {
                                var currentURL = window.location.href;
                                if (currentURL.indexOf("hochseeschein") !== -1) {
                                    if (data.settings) {
                                        loadFeed(sk_google_reviews);
                                    } else {
                                        requestFeedData(sk_google_reviews);
                                    }
                                } else {
                                    loadCssFile("https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css");
                                    loadScript("https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js", function() {
                                        loadScript("https://cdn.jsdelivr.net/npm/@splidejs/splide-extension-auto-scroll@0.5.3/dist/js/splide-extension-auto-scroll.min.js", function() {
                                            if (data.settings) {
                                                loadFeed(sk_google_reviews);
                                            } else {
                                                requestFeedData(sk_google_reviews);
                                            }
                                        });
                                    });
                                }
                            } else {
                                if (getDsmSetting(sk_google_reviews, 'smooth_carousel_movement') == 0) {
                                    loadScript(app_url + "libs/updated-libraries/swiper.min.js", function() {
                                        if (data.settings) {
                                            loadFeed(sk_google_reviews);
                                        } else {
                                            requestFeedData(sk_google_reviews);
                                        }
                                    });
                                } else {
                                    if (data.settings) {
                                        loadFeed(sk_google_reviews);
                                    } else {
                                        requestFeedData(sk_google_reviews);
                                    }
                                }
                            }
                        } else {
                            if (data.settings) {
                                loadFeed(sk_google_reviews);
                            } else {
                                requestFeedData(sk_google_reviews);
                            }
                        }
                    }
                });
            }).catch(function(err) {
                loadSettingsData(sk_google_reviews, json_settings_url, json_settings_url);
            });
        }
        jQuery(document).ready(function($) {
            if (jQuery.find('div[data-embed-id="142714"]').length > 1) {
                var script_src = jQuery(jQuery('script[src="https://widgets.sociablekit.com/google-reviews/widget.js"]')[1]);
                if (script_src) {
                    script_src.remove();
                    jQuery.find('div[data-embed-id="142714"]')[1].remove();
                }
            }
            if (jQuery.find('div[data-embed-id="106598"]').length > 1) {
                jQuery("div.showMobile2Theme").remove();
                jQuery('.sk-ww-google-reviews').each(function(index) {
                    if (index == 1) {
                        var sk_google_reviews = jQuery(this);
                        var embed_id = getDsmEmbedId(sk_google_reviews);
                        var new_sk_google_reviews_height = jQuery(window).height() + 100;
                        sk_google_reviews.height(new_sk_google_reviews_height);
                        var json_settings_url = app_file_server_url.replace('feed', '') + "settings/" + embed_id + "/settings.json?nocache=" + (new Date()).getTime();
                        var json_feed_url = app_file_server_url + embed_id + ".json?nocache=" + (new Date()).getTime();
                        loadSettingsData(sk_google_reviews, json_settings_url, json_feed_url);
                    }
                });
            } else {
                jQuery('.sk-ww-google-reviews').each(function() {
                    var sk_google_reviews = jQuery(this);
                    sk_google_reviews.closest('div#custom-html-d').attr('id', 'custom-html-div');
                    var embed_id = getDsmEmbedId(sk_google_reviews);
                    var new_sk_google_reviews_height = jQuery(window).height() + 100;
                    sk_google_reviews.height(new_sk_google_reviews_height);
                    var json_settings_url = app_file_server_url.replace('feed', '') + "settings/" + embed_id + "/settings.json?nocache=" + (new Date()).getTime();
                    var json_feed_url = app_file_server_url + embed_id + ".json?nocache=" + (new Date()).getTime();
                    loadSettingsData(sk_google_reviews, json_settings_url, json_feed_url);
                });
            }
            jQuery(document).on('click', '.swiper-prev-arrow,.swiper-next-arrow', function() {
                var sk_google_reviews = jQuery('.sk-ww-google-reviews');
                skLayoutSliderArrowUI(sk_google_reviews);
            });
            jQuery(window).resize(function() {
                jQuery('.sk-ww-google-reviews').each(function() {
                    var sk_google_reviews = jQuery(this);
                    if (jQuery(document).width() < 767) {
                        loadFeed(sk_google_reviews);
                    }
                });
            });
            jQuery(document).on('click', '.prev_sk_google_review', function() {
                var clicked_element = jQuery(this);
                clicked_element.html("<i class='fa fa-spinner fa-pulse' aria-hidden='true'></i>");
                var new_clicked_element = jQuery('.sk_selected_reviews').prev('.sk_reviews_grid-item');
                var content_src = new_clicked_element.find('.sk-review-popup');
                showPopUp(jQuery, content_src, new_clicked_element);
            });
            jQuery(document).on('click', '.next_sk_google_review', function() {
                var clicked_element = jQuery(this);
                clicked_element.html("<i class='fa fa-spinner fa-pulse' aria-hidden='true'></i>");
                var new_clicked_element = jQuery('.sk_selected_reviews').next('.sk_reviews_grid-item');
                var content_src = new_clicked_element.find('.sk-review-popup');
                showPopUp(jQuery, content_src, new_clicked_element);
            });
            jQuery(document).on('click', '.google-reviews-item', function() {
                var clicked_element = jQuery(this).closest('.sk_reviews_grid-item');
                var content_src = clicked_element.find('.sk-review-popup');
                var sk_google_reviews = clicked_element.closest('.sk-ww-google-reviews');
                if (getDsmSetting(sk_google_reviews, 'show_reviews_on_new_tab') == 1 && getDsmSetting(sk_google_reviews, 'links_clickable') == 1) {
                    var url = jQuery(this).attr('data-link');
                    window.open(url, '_blank');
                } else if (getDsmSetting(sk_google_reviews, 'show_reviews_on_new_tab') == 0) {
                    if (content_src.length > 0 && clicked_element.length > 0) {
                        showPopUp(jQuery, content_src, clicked_element);
                    }
                }
            });
            jQuery(document).on('click', '.sk-google-reviews-load-more-posts', function() {
                if (jQuery(this).attr('disabled') == "disabled") {
                    return false;
                }
                jQuery(this).attr('disabled', 'disabled');
                var current_btn = jQuery(this);
                var current_btn_text = current_btn.text();
                var sk_google_reviews = jQuery(this).closest('.sk-ww-google-reviews');
                jQuery(this).html("<i class='fa fa-spinner fa-pulse' aria-hidden='true'></i>");
                var post_items = "";
                setTimeout(function() {
                    var enable_button = false;
                    var old_last_key = last_key;
                    last_key = old_last_key + parseInt(getDsmSetting(sk_google_reviews, 'post_count'));
                    for (var i = old_last_key; i < last_key; i++) {
                        if (typeof data_storage[i] != 'undefined') {
                            post_items += "<div class='sk_reviews_grid-item'>";
                            post_items += getFeedItem(data_storage[i], sk_google_reviews, data_bio);
                            post_items += "</div>";
                        }
                    }
                    if (data_storage.length > last_key) {
                        enable_button = true;
                    }
                    sk_google_reviews.find('.sk_reviews_grid').append(post_items);
                    if (enable_button) {
                        current_btn.html(current_btn_text);
                        current_btn.show();
                    } else {
                        current_btn.hide();
                    }
                    current_btn.removeAttr('disabled');
                    applyCustomUi(jQuery, sk_google_reviews);
                    applyMasonry();
                    fixMasonry();
                }, 300);
            });
            jQuery(document).on('click', '.sk-ww-google-reviews .sk-watermark', function() {
                jQuery('.sk-ww-google-reviews .sk-message').slideToggle();
            });
        });
    }
}(window, document));
