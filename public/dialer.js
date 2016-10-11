App = Ember.Application.create();

App.Router.map(function() {
  this.route('call', { path: '/call' });
  this.route('index', { path: '/' });
});

App.IndexController = Ember.Controller.extend({
  init: function() {
    var self = this;

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
      self.set('connection', null);
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
    toggleCall: function() {
      this.toggleProperty('onPhone');
    }
  }
});