/*
 *      Vape is a lightweight plugin that automatically saves form data and restores it after browser
 *      crashes or users closing tabs by accident. The magic is done using HTML5 local storage and it
 *      fallbacks to cookies if local storage is not supported. Once the user submits the form all data
 *      is cleared and the process starts again. It's built to be non-intrusive with your code, just 
 *      pass in the forms to protect and done! 
 *
 *      Vape requires jQuery to work and it also assumes each form has the html id attribute set.
 *
 *
 *      by Enrique Gonzalez (Enriikke)
 *      helloimenrique.com
 *      enrique@chiibo.com
 *
 *      enjoy!
 *
 */
(function($) {

        $.fn.vape = function(options) {
                
                // Constants to check for the storage method being used.
                var STORAGE_METHOD_LOCAL = 'LOCAL_STORAGE';
                var STORAGE_METHOD_COOKIES = 'COOKIE_STORAGE';
                
                
                // Vape settings that can be customized.
                var settings = $.extend({
                        
                        ignore_fields:          [':submit', ':reset', ':button', ':file', ':password'],
                        fallback_to_cookies:    true,
                        cookie_expires:         7
                        
                }, options);
                
                
                
                /****************************************************************************************************
                        READ AND WRITE FUNCTIONS FOR LOCAL STORAGE AND COOKIES
                *****************************************************************************************************/
                
                /*
                 *      Creates a new entry in local storage if available. It also checks if we have reached
                 *      the maximum data capacity allowed by HTML5 local storage. If the value is ommited
                 *      then the function will delete the storage entry instead.
                 *
                 *      name:   refers to the unique identifier of the element we are trying to create.
                 *      value:  the value of the element to be created.
                 *
                 */
                var writeToLocalStorage = function(name, value) {
                        
                        // Try to write to local storage and catch the quota exceeded error when it happens.
                        try { 
                        
                                if(value) localStorage.setItem(name, value);
                                else localStorage.removeItem(name);
                        }
                        catch(e) { console.log('VAPE ERROR: exceeded data quota'); }    
                };
                
                
                
                /*
                 *      Added a wrapper to the local storage built-in getItem function to maintain consistency.
                 *      Allows vape to read from local storage.
                 *
                 *      name:   refers to the unique identifier of the element we are trying to read.
                 *
                 */
                var readFromLocalStorage = function(name) {
                        
                        // Simple call to get the value of the given name (key).
                        return localStorage.getItem(name);
                };
                
                
                
                /*
                 *      Creates a cookie on the current domain. It also allows to set some optional parameters.
                 *      If the value is ommited then the function will delete the cookie instead.
                 *
                 *      name:           refers to the unique idenfifier of the cookie we are trying to write.
                 *      value:          the value of the cookie to be created.
                 *      expires:        [optional] sets an expiration date for the cookie in days.
                 *      path:           [optional] specifies the path of the cookie.
                 *      domain:         [optional] sets a domain for the cookie.
                 *      secure:         [optional] if true then the cookie will require a secure connection (https).
                 *
                 */
                var writeCookie = function(name, value, options) {
                        
                        // Checks if the options dictionary was given, otherwise sets it to an empty dictionary.
                        options = options? options : {};
                        
                        
                        // Sets the expires parameter to a negative number if the user does not provide a value
                        // for the cookie so that it gets deleted instead.
                        var expires = value? options.expire : -1;
                        
                        
                        // Convert the expires parameter to an actual date to include in the cookie declaration.
                        if(typeof(expires) == 'number') {
                                
                                var date = new Date();
                                date.setTime(date.getTime() + (expires * 8640000));
                                expires = '; expires=' + date.toUTCString();
                                
                        } else expires = '';
                        
                        
                        // Checks if any of the optional parameters was given, otherwisw sets it to the default value.
                        var path = options.path? '; path=' + options.path : '';
                        var domain = options.domain? '; domain=' + options.domain : '';
                        var secure = options.secure? '; secure' : '';
                        
                        
                        // Finally create the cookie!!
                        document.cookie = [name + '=', encodeURIComponent(value), expires, path, domain, secure].join('');
                };
                
                
                
                /*
                 *      Reads a cookie by iterating through all cookies for the current domain.
                 *
                 *      name:   refers to the unique identifier of the cookie we are trying to read.
                 */
                var readCookie = function(name) {
                        
                        // Get all the stored cookies for the current domain.
                        var cookies = document.cookie.split(';');
                        
                        
                        // Iterate through every cookie until we find the one we are looking for (name).
                        for(var i = 0; i < cookies.length; i++) {
                                
                                // Get the cookie name and value by parsing a standard cookie declaration.
                                var cookie_name = cookies[i].substr(0, cookies[i].indexOf('=')).replace(/^\s+|\s+$/g, '');
                                var cookie_value = cookies[i].substr(cookies[i].indexOf('=') + 1);
                                
                                
                                // If we find the cookie we are looking for then return its value.
                                if(cookie_name == name) return unescape(cookie_value);
                        }
                        
                        
                        // Return undefined if we couldn't find the cookie or if they are disabled.
                        return undefined;
                };
                
                
                
                /****************************************************************************************************
                        FUNCTIONS TO CHECK WHICH STORAGE METHOD CAN BE USED 
                *****************************************************************************************************/
                
                /*
                 *      Checks if the browser supports HTML5 local storage or not.
                 *
                 */
                var isLocalStorageSupported = function() {
                        
                        if(typeof(Storage) !== 'undefined') return true;
                        else return false;
                };
                
                
                
                /*
                 *      Checks if the browser has cookies enabled.
                 *
                 */
                var areCookiesEnabled = function() {
                        
                        // Best way to know if cookies are enabled is to actually create a cookie.
                        writeCookie('vape_cookie_test', 'vape');
                        var vape_cookie_test = readCookie('vape_cookie_test');
                        
                        if(vape_cookie_test) return true;
                        else return false;
                };
                
                
                
                /****************************************************************************************************
                        NICE UTIL FUNCTIONS FOR VAPE TO WORK 
                *****************************************************************************************************/
                
                /*
                 *      Generates a unique identifier for the given form. It requires the form element to have
                 *      an html id attribute to ensure uniqness. It alse prefixes vape to avoid conflicts with
                 *      other cookies or elements in local storage.
                 *
                 *      form:   the parent form of the field we are trying to generate a name for.
                 *      field:  the field that we are trying to generate a name for.
                 *
                 */
                var generateFiledName = function(form, field) {
                        
                        return ['vape', form.attr('id'), field.attr('id'), field.attr('name')].join('~');
                };
                
                
                
                /*
                 *      Gathers all the fields that need to be protected. It filters out all the elements that are part
                 *      of the ignore_fields array defined by the user or using default settings.
                 *
                 *      form:   the form that we are trying to protect.
                 */
                var getFieldsToProtect = function(form) {
                        
                        form_inputs = $.merge(form.find('input'), form.find('textarea'));
                        for(var i = 0; i < settings.ignore_fields.length; i++) form_inputs = form_inputs.not(settings.ignore_fields[i]);
                        
                        return form_inputs;
                };
                
                
                
                /****************************************************************************************************
                        RESTORE, PROTECT, AND RELEASE FUNCTIONS
                *****************************************************************************************************/
                
                /*
                 *      Restores the data if available when the page loads.
                 *
                 *      form:   the form that needs its data to be restored.
                 *      fields: the fields that are part of the given form.
                 *      method: the storage method that is being used.
                 */
                var restoreData = function(form, fields, method) {
                        
                        fields.each(function() {
                                
                                var field = $(this);
                                var restored_value = '';
                                var field_name = generateFiledName(form, field);
                        
                                if(method == STORAGE_METHOD_LOCAL) restored_value = readFromLocalStorage(field_name) || field.val();
                                else restored_value = readCookie(field_name) || field.val();
                        
                                field.val(restored_value);
                        });
                };
                
                
                
                /*
                 *      Binds the data protection to each individual field keyup event. It will write to local storage
                 *      or create cookies everytime the field changes.
                 *
                 *      form:   the form that needs its data to be protected.
                 *      fields: the fields that are part of the given form.
                 *      method: the storage method that is being used.
                 */
                var protectData = function(form, fields, method) {
                        
                        fields.each(function() {
                                
                                var field = $(this);
                                var field_name = generateFiledName(form, field);
                        
                                if(method == STORAGE_METHOD_LOCAL) field.keyup(function() { writeToLocalStorage(field_name, field.val()); });
                                else field.keyup(function() { writeCookie(field_name, field.val(), {expires: settings.cookie_expires}); });
                        });
                };
                
                
                
                /*
                 *      Binds the data release to form submit or form reset. It will clear out everything for the
                 *      given form from local storage or cookies.
                 *
                 *      form:   the form that needs its data to be released.
                 *      fields: the fields that are part of the given form.
                 *      method: the storage method that is being used.
                 */
                var releaseData = function(form, fields, method) {
                        
                        form.bind('submit reset', function() {
                                
                                fields.each(function() {
                                        
                                        if(method == STORAGE_METHOD_LOCAL) writeToLocalStorage(generateFiledName(form, $(this)));
                                        else writeCookie(generateFiledName(form, $(this)));             
                                });
                        });
                };
                
                
                
                /****************************************************************************************************
                        THE MAGIC HAPPENS HERE 
                *****************************************************************************************************/
                
                return this.each(function() {
                
                        // Create an array with all the inputs of the current form.
                        var $this_form = $(this);
                        var protected_fields = getFieldsToProtect($this_form);
                        var storage_method = undefined;
                        
                        
                        // Figure out which storage method should be used. If none is available then vape can't be used.
                        if(isLocalStorageSupported()) storage_method = STORAGE_METHOD_LOCAL;
                        else if(settings.fallback_to_cookies && areCookiesEnabled()) storage_method = STORAGE_METHOD_COOKIES;
                        
                        
                        if(storage_method) {
                                
                                // Restore data if available then bind data protection and data release.
                                restoreData($this_form, protected_fields, storage_method);
                                protectData($this_form, protected_fields, storage_method);
                                releaseData($this_form, protected_fields, storage_method);
                                
                        } else {
                                
                                // We can't use local storage or cookies :(
                                console.log('VAPE ERROR: we are sorry :( but neither HTML5 localStorage nor cookies can be used');
                        }
                });
        };
        
})(jQuery);