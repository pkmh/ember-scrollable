import Ember from 'ember';
import { test } from 'ember-qunit';
import '../helpers/define-fixture';
import '../helpers/request-watcher';
import constants from '../helpers/constants';
import testHelper from '../test-helper';

module("Team", {
  setup: function() {
    testHelper.setup.apply(this, arguments);

    defineFixture('/teams', {}, {
      "teams": [{
        "name": "Example Team",
        "id": 1,
        "office": "Example Office"
      }]
    });

    defineFixture('/projects', { team_id: '1' }, {
      "angles": [{
        "id": 1,
        "title": "Angle 1",
        "project_id": 1,
        "angle_team_membership_ids": [1]
      },{
        "id": 2,
        "title": "Angle 2",
        "project_id": 2,
        "angle_team_membership_ids": [2]
      }],

      "angle_team_memberships": [{
        "target_value": 4,
        "id": 1,
        "created_at": "2014-07-09T16:46:03.347+01:00",
        "angle_id": 1,
        "team_member_id": 1
      },{
        "target_value": 2,
        "id": 2,
        "created_at": "2014-07-09T16:46:03.347+01:00",
        "angle_id": 2,
        "team_member_id": 1
      }],

      "projects": [{
        "id": 1,
        "status": "high",
        "name": "Example Project",
        "client_code": "EP",
        "details_url": "/projects/1",
        "created_at": "2009-07-14T17:05:32.909+01:00",
        "angle_ids": [1],
        "analyst_1_id": 1,
        "proposed_advisors_count": 1,
        "left_to_schedule_advisors_count": 0,
        "upcoming_interactions_count": 0
      }, {
        "id": 2,
        "status": "medium",
        "name": "Example Project 2",
        "client_code": "2EP",
        "details_url": "/projects/2",
        "created_at": "2008-07-14T17:05:32.909+01:00",
        "angle_ids": [2],
        "analyst_1_id": 1,
        "proposed_advisors_count": 1,
        "left_to_schedule_advisors_count": 0,
        "upcoming_interactions_count": 0
      }]
    });
  },

  teardown: function() {
    testHelper.teardown.apply(this, arguments);
  }
});

test("Read project list", function() {
  visit('/team');
  wait();

  andThen(function() {
    var projects = find('.project').toArray().map(function(project) {
      var $project = $(project);

      return {
        title: $project.find('h1 span').text().trim(),
        clientCode: $project.find('h1 small').text().trim(),
        highPriority: $project.find('.priority.high').length === 1,
        mediumPriority: $project.find('.priority.medium').length === 1,
        lowPriority: $project.find('.priority.low').length === 1,
        memberAvatarUrl: $project.find('.members .avatar:not(.lead)').prop('src'),
        leadAvatarUrl: $project.find('.members .avatar.lead').prop('src'),
        deliveredCount: parseInt($project.find('.progress .delivered .count').text().trim(), 10),
        targetCount: parseInt($project.find('.progress .target .count').text().trim(), 10),
        progressBarWidth: $project.find('.progress .progress-bar > div').prop('style').width
      };
    });

    deepEqual(projects, [{
      title: 'Example Project',
      clientCode: 'EP',
      highPriority: true,
      mediumPriority: false,
      lowPriority: false,
      memberAvatarUrl: constants.EMPTY_IMAGE_URL,
      leadAvatarUrl: constants.EMPTY_IMAGE_URL,
      deliveredCount: 1,
      targetCount: 4,
      progressBarWidth: '25%'
    }, {
      title: 'Example Project 2',
      clientCode: '2EP',
      highPriority: false,
      mediumPriority: true,
      lowPriority: false,
      memberAvatarUrl: constants.EMPTY_IMAGE_URL,
      leadAvatarUrl: constants.EMPTY_IMAGE_URL,
      deliveredCount: 1,
      targetCount: 2,
      progressBarWidth: '50%'
    }]);
  });
});

test("Sort project list", function() {
  visit('/team');

  var projectTitles = function() {
    return find('.project').toArray().map(function(project) {
      return $(project).find('h1 span').text().trim();
    });
  };

  fillIn('.projects .sort-by-select select', 'client');

  andThen(function() {
    deepEqual(projectTitles(), ['Example Project 2', 'Example Project']);
  });

  fillIn('.projects .sort-by-select select', 'creation-date');

  andThen(function() {
    deepEqual(projectTitles(), ['Example Project', 'Example Project 2']);
  });

  fillIn('.projects .sort-by-select select', 'priority');

  andThen(function() {
    deepEqual(projectTitles(), ['Example Project', 'Example Project 2']);
  });
});

test("Change project priority", function() {
  var watcher = requestWatcher('put', '/projects/1', {}, {
    "project": {
      "client_code": "EP",
      "created_at": "2009-07-14T16:05:32.909Z",
      "details_url": "/projects/1",
      "left_to_schedule_advisors_count": 0,
      "name": "Example Project",
      "proposed_advisors_count": 1,
      "status": "low",
      "upcoming_interactions_count": 0,
      "analyst_1_id": "1"
    }
  }, {});

  visit('/team');

  click('.project:first .change-priority');
  click('.project:first .change-priority .dropdown-item.low');

  andThen(function() {
    equal(watcher.called, true);
    equal(find('.project:last .change-priority.low').length, 1);
  });
});