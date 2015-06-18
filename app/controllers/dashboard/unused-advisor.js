import Ember from 'ember';
import ModelsNavigationMixin from 'ember-cli-paint/mixins/models-navigation';
import notify from 'phoenix/helpers/notify';

export default Ember.Controller.extend(ModelsNavigationMixin, {
  needs: ['dashboard'],
  dashboard: Ember.computed.oneWay('controllers.dashboard'),

  navigableModels: Ember.computed.oneWay('dashboard.unusedAdvisors'),
  modelRouteParams: ['dashboard.unused-advisor'],

  queryParams: ["page", "perPage"],
  pageBinding: "emails.page",
  perPageBinding: "emails.perPage",
  totalPagesBinding: "emails.totalPages",
  page: 1,
  perPage: 10,
  model: null,
  showFollowUp: false,
  emailDelivery: null,
  emailTemplates: null,

  _paramatizeEmailAddresses: function(emailString) {
    if (emailString !== undefined) {
      return emailString.replace(/\s+/g, ',').replace(/,+/, ',');

    } else {
      return undefined;
    }
  },

  actions: {
    hideSidePanel: function() {
      this.transitionToRoute('dashboard');
    },

    remove: function() {
      this.get('model').destroyRecord().then(() => {
        notify(`The advisor ${this.get('model.advisor.name')} was removed from the list.`);
        this.get('sidePanel').send('close');
      });
    },

    toggleFollowUp: function() {
      this.get('sidePanel').send('toggleDrawer');
    },

    preview: function() {
      this.get('emailComposer').send('togglePreview');
    },

    send: function() {
      let email = this.get('emailDelivery');

      email.setProperties({
        recipients: this._paramatizeEmailAddresses(email.get('recipients')),
        cc: this._paramatizeEmailAddresses(email.get('cc')),
        bcc: this._paramatizeEmailAddresses(email.get('bcc'))
      });

      email.save().then(() => {
        notify(`Your email has been sent.`);
        this.get('sidePanel').send('close');
      }).catch(function() {
        notify('There has been an error sending your email.', 'error');
      });
    },
  }
});
