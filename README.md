Vape
====

Vape automatically saves your form data in case of a browser crash (or dropping your laptop from the rooftop of a building before hitting send on that important job application). The magic is done using HTML5 Local Storage and fallbacks to cookies if you are using an awesomeless browser (you know who I'm talking about). Once the form is submitted all data is cleared out.


## Usage

Just pass in the forms you want to protect and you are done! Non-intrusive awesomeness.

```javascript

// Protect a single form
$('#contact-form').vape();

// Or protect all forms
$('form').vape();

```


## Dependencies

* jQuery: Vape was built using jQuery version 1.8.0 so anything from 1.8.0 and above should be good to go.
* Forms need to have IDs: this is a weird "dependency" but right now Vape depends on a form ID in order to accurately save and restore data. I promise I will work on eliminating this just hang in there.


## License

Vape is under the MIT open source license. Check out the license file for more :)

