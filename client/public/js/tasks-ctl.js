var gsd = angular.module('gsd', ['TaskService'])

gsd.controller('TaskController', function($scope, Task) {
    $scope.tags = [];
    $scope.orderProp = 'done';

    var tags;
    function findAllTags() {
        tags = {};
        for (var i = 0; i < $scope.tasks.length; ++i) {
            var c = $scope.tasks[i].content;
            findTags(c);
        }
        $scope.tags = [];
        for (var t in tags) {
            $scope.tags.push(t);
        }
        $scope.tags.sort();
    }

    var reloadTasks = function () {
        var method = (archivedMode) ? Task.archived : Task.query;
        $scope.tasks = method(function() {
            findAllTags();
        });
    }
    var archivedMode = false;
    reloadTasks();

    $scope.getCurrentTasks = function() {
        archivedMode = false;
        reloadTasks();
    }

    $scope.getArchivedTasks = function() {
        archivedMode = true;
        $scope.tasks = Task.archived(function() {
            findAllTags();
        });
    }

    function findTags(val) {
        var results = val.match(/@(\w+)/g);
        for (var i in results) {
            tags[results[i]] = true;
        }
    }

    $scope.updateSearch = function(tag) {
        $scope.query = tag;
    }

    $scope.addTask = function() {
        var t = new Task({content: $scope.content});
        t.$save(function(a,b,c) {
            // success
            reloadTasks();
            $scope.content = '';
        }, function(err) {
            // error
            $scope.error = 'Error when adding a task';
        });
    }

    $scope.toggleDone = function(task) {
        task.done = !task.done;
        task.$save(function() {
            // success
        }, function(err) {
            // error
            $scope.error = 'Error when setting the task as done';
        });
    }

    $scope.deleteTask = function(task) {
        var tid = task.id;
        task.$delete(function() {
            // success
            reloadTasks();
        }, function() {
            // error
            $scope.error = 'Error when deleting the task';
        });
    }

    var currentTask = null;

    var Modal = (function() {
        var editModal = $('[data-reveal]');
        function _open() {
            editModal.foundation('reveal', 'open');
        }
        function _close() {
            editModal.foundation('reveal', 'close');
        }
        return {
            open: _open,
            close: _close
        }
    })();

    $scope.editCurrent = function(task) {
        $scope.edit_id = task.id;
        $scope.edit_content = task.content;
        currentTask = task;
        Modal.open();
    }

    $scope.updateTask = function() {
        var editId = $scope.edit_id | 0;

        if (editId === -1 || editId !== currentTask.id) {
            $scope.edit_status = 'Inconsistent state: please reload the page';
            return;
        }

        currentTask.content = $scope.edit_content;
        currentTask.$save(function() {
            // success
            reloadTasks();
            Modal.close();
        }, function() {
            // error
            $scope.edit_status = 'Error when updating the task content';
        });
    }

    $scope.archiveTask = function(task) {
        task.archived = true;
        task.$save(function() {
            // success
            reloadTasks();
        }, function() {
            // error
            $scope.edit_status = 'Error when archiving the task content';
        });
    }
});
