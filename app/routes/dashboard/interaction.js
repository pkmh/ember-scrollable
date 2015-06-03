import Ember from 'ember';
import SidePanelRouteMixin from 'ember-cli-paint/mixins/side-panel-route';

export default Ember.Route.extend(SidePanelRouteMixin, {
  model: function(params) {
    return this.store.find('interaction', params.interaction_id).then((interaction) => {
      return Ember.RSVP.hash({
        interaction: interaction,

        completion: this.store.createRecord('interactionCompletion', {
          interaction: interaction,
          interactionType: 'call'
        })
      });
    });
  },

  setupController: function(controller, models) {
    controller.set('model', models.interaction);
    controller.set('completion', models.completion);
  }
});
