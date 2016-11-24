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
    this.set('validPhone', Ember.computed('currentNumber', function() {
      return /^([0-9]|#|\*)+$/.test(this.get('currentNumber').replace(/[-()\s]/g,''));
    }));
    this.set('fullNumber', Ember.computed('countryCode', 'currentNumber', function() {
      return '+' + this.get('countryCode') + this.get('currentNumber').replace(/\D/g, '');
    }));

    // Fetch Twilio capability token from our Node.js server
    $.getJSON('/token').done(function(data) {
      Twilio.Device.setup(data.token);
    }).fail(function(err) {
      console.log(err);
      self.set('logtext', 'Could not fetch token, see console.log');
    })

    Twilio.Device.ready(function() {
      self.set('logtext', 'Browser dialer is ready..')
    })
    // Configure event handlers for Twilio Device
    Twilio.Device.disconnect(function() {
      self.set('onPhone', false);
      self.set('logtext', 'Call ended.');
    });

    // Set countries
    this.set('countries', [
      { name: 'United States', cc: '1', code: 'us' },
      { name: 'Brazil', cc: '55', code: 'br' },
      { name: 'Colombia', cc: '57', code: 'co' },
      { name: 'Ecuador', cc: '593', code: 'ec' },
      { name: 'Estonia', cc: '372', code: 'ee' },
      { name: 'Germany', cc: '49', code: 'de' },
      { name: 'Great Britain', cc: '44', code: 'gb' },
      { name: 'Hong Kong', cc: '852', code: 'hk' },
      { name: 'Ireland', cc: '353', code: 'ie' },
      { name: 'Mexico', cc: '52', code: 'mx' },
      { name: 'Singapore', cc: '65', code: 'sg' },
      { name: 'Spain', cc: '34', code: 'es' },
    ]);
  },
  actions: {
    // Handle country code selection
    selectCountry: function(country) {
      this.set('countryCode', country.cc);
    },

    // Handle muting
    toggleMute: function() {
      var muted = this.get('muted');
      this.set('muted', !muted);

      Twilio.Device.activeConnection().mute(!muted);
    },

    // Handle numeric buttons
    sendDigit: function(digit) {
      Twilio.Device.activeConnection().sendDigits(digit);
    },

    // Make an outbound call with the current number,
    // or hang up the current call
    toggleCall: function() {
      if (!this.get('onPhone')) {
        this.set('onPhone', true);
        this.set('muted', false);

        // make outbound call with current number
        var n = this.get('fullNumber');
        Twilio.Device.connect({ number: n });
        this.set('logtext', 'Calling ' + n);
      } else {
        // hang up call in progress
        Twilio.Device.disconnectAll();
      }
    }
  }
});
