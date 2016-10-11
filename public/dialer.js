App = Ember.Application.create();

App.Router.map(function() {
  this.route('call', { path: '/call' });
  this.route('index', { path: '/' });
});

App.IndexController = Ember.Controller.extend({
  init: function() {
    var self = this;

    // Default values
    this.set('countryCode', '1');
    this.set('currentNumber', '');
    this.set('muted', false);
    this.set('onPhone', false);

    // Fetch Twilio capability token from our Node.js server
    $.getJSON('/token').done(function(data) {
      self.set('identity', data.identity);
      Twilio.Device.setup(data.token);
      self.set('logtext', 'Connected with generated client name "'+ self.identity + '"');
      console.log('Connected with generated client name "'+ self.identity + '"');
    }).fail(function(err) {
      console.log(err);
      self.set('logtext', 'Could not fetch token, see console.log');
    })

    // Configure event handlers for Twilio Device
    Twilio.Device.disconnect(function() {
      self.set('onPhone', false);
      self.set('log', 'Call ended.');
    });

    // Set countries
    this.set('countries', [
      { name: 'United States', cc: '1', code: 'us' },
      { name: 'Great Britain', cc: '44', code: 'gb' },
      { name: 'Colombia', cc: '57', code: 'co' },
      { name: 'Ecuador', cc: '593', code: 'ec' },
      { name: 'Estonia', cc: '372', code: 'ee' },
      { name: 'Germany', cc: '49', code: 'de' },
      { name: 'Hong Kong', cc: '852', code: 'hk' },
      { name: 'Ireland', cc: '353', code: 'ie' },
      { name: 'Singapore', cc: '65', code: 'sg' },
      { name: 'Spain', cc: '34', code: 'es' },
      { name: 'Brazil', cc: '55', code: 'br' },
    ]);
  },
  actions: {
    selectCountry: function(country) {
      this.set('countryCode', country.cc);
    },
    toggleCall: function() {
      if (!this.get('onPhone')) {
        this.set('onPhone', true);
        this.set('muted', false);

        // make outbound call with current number
        var n = '+' + this.get('countryCode') + this.get('currentNumber').replace(/\D/g, '');
        Twilio.Device.connect({ number: n });
        this.set('log', 'Calling ' + n);
      } else {
        // hang up call in progress
        Twilio.Device.disconnectAll();
      }
    }
  }
});