'use strict';

$(function() {
    var resize = [];
    var initState = {
        students: [
            {
                id: 0,
                name: 'Student One',
                prior: [0,1]
            },
            {
                id: 1,
                name: 'Student Two',
                prior: [1]
            },
            {
                id: 2,
                name: 'Student Three',
                prior: [0]
            },
            {
                id: 3,
                name: 'Student Four',
                prior: [2]
            },
            {
                id: 4,
                name: 'Student Five',
                prior: [0,2]
            }
        ],
        mentors: [
            {
                id: 0,
                name: "Mentor One",
                prior: [0,2,4]
            },
            {
                id: 1,
                name: "Mentor Two",
                prior: [1,3]
            },
            {
                id: 2,
                name: "Mentor Three",
                prior: [3,4]
            }
        ],
        tasks: [],
        groups: []
    };

    const ACTION_TYPE = [
        "ADD",
        "REMOVE",
        "MODIFY"
    ]

    var munkres = new Munkres();

    const find = (users, id) => {
        return users.filter(user => user.id === id)[0]
    }

    var reducer = (state, action) => {
        let type;
        switch (action.type) {
            case "ADD":
                type = (function() {
                    switch (action.value.type.toUpperCase()) {
                        case "STUDENT":
                            return "students"
                        case "MENTOR":
                            return "mentors"
                        case "TASK":
                            return "tasks"
                        case "GROUP":
                            return "groups"
                        default:
                            throw "value.type undefined"
                    }
                }());

                let newItem = (function() {
                    switch (type) {
                        case "students":
                        case "mentors":
                            return {
                                id: state[type].length,
                                name: action.value.name,
                                prior: action.value.prior || []
                            }
                        case "tasks":
                            if (!action.value.task
                                && !action.value.assign.type
                                && ["students", "groups"].indexOf(action.value.assign.type)
                                && !action.value.assign.id) {
                                throw "uncorrect data"
                            }

                            return {
                                id: state[type].length,
                                task: action.value.task,
                                assign: state[action.value.assign].filter(item => item.id === action.value.assign.id),
                                check: false
                            }
                        case "groups":
                            if (action.value.members.each(member => {
                                return state.students.indexOf(member)+1 != 0
                            })) {
                                throw "uncorrect data"
                            }

                            return {
                                id: state[type].length,
                                members: action.value.members
                            }
                    }
                }());

                return Object.assign({}, state, {
                    [type]: state[type].concat(newItem)
                })

            case "REMOVE":
                type = (function() {
                    switch (action.value.type.toUpperCase()) {
                        case "STUDENT":
                            return "students"
                        case "MENTOR":
                            return "mentors"
                        case "TASK":
                            return "tasks"
                        case "GROUP":
                            return "groups"
                        default:
                            throw "value.type undefined"
                    }
                }());

                if (state[type].indexOf(action.value.id) + 1 == 0) {
                    throw type + ' not found'
                }

                return Object.assign({}, state, {
                    students: state[type].filter(item => item.id !== item.id)
                })
            case "MODIFY":
                type = (function() {
                    switch (action.value.type.toUpperCase()) {
                        case "STUDENT":
                            return "students"
                        case "MENTOR":
                            return "mentors"
                        case "TASK":
                            return "tasks"
                        case "GROUP":
                            return "groups"
                        default:
                            throw "value.type undefined"
                    }
                }());

                let modItem = (function() {
                    if (!action.value.id && state[type].length - 1 >= action.value.id) {
                        throw "Item not found"
                    }
                    let item = find(state[type], action.value.id)
                    switch (type) {
                        case "students":
                        case "mentors":
                            return {
                                name: action.value.name || item.name,
                                prior: action.value.prior || item.prior
                            }
                        case "tasks":
                            return {
                                assign: action.value.assign || item.assign,
                                check: action.value.check || item.check,
                                task: action.value.task || item.task,
                            }
                        case "groups":
                            return {
                                members: action.value.members || item.members
                            }
                    }
                }());
            default:
                return state
        }
    }

    var store = createStore(reducer, initState);
    window.test = store;
    $('#terminal').terminal(function(command, term) {
        let commands = command.split(" ");
        switch (commands[0]) {
            case 'help':
                term.echo(
                  'Доступные команды:\n' +
                  '  state           узнать состояние\n'+
                  '  distribution    распределить студентов по менторам\n' +
                  '  dispath         произвести модификацию\n'
                );
                break;
            case 'state':
                term.echo(JSON.stringify(store.getState(), 4, 4))
                break;
            case 'distribution':
                const setupToJson = (setup) => {
                    var output = {}
                    setup.forEach((value, key) => {
                        let students = []
                        value.forEach(student => {
                            students.push(student.name)
                        })
                        output[key.name] = students
                    })
                    return output
                }

                let state = store.getState();
                let setup = distribution(state, munkres)

                term.echo(JSON.stringify(setupToJson(setup), 4, 4))
                break
            case 'dispatch':
                var action;
                try {
                    action = JSON.parse(commands[1])
                    if (ACTION_TYPE.indexOf(action.type) + 1 == 0) {
                        throw 'action.type undefined'
                    }
                    store.dispatch(action)
                    term.echo('Ok!')
                } catch (e) {
                    term.echo(e)
                }
                break;
            default:
                term.echo(
                  'Неизвестная команда\n' +
                  'Для вызова справки наберите [[b;#0E1;#000]help]\n'
                );
        }
    }, {
        greetings: null,
        onInit: function(term) {
            term.echo('Добро пожаловать!\n\nДля вызова справки наберите [[b;#0E1;#000]help]');
        },
        onResize: function(term) {
            for (var i=resize.length;i--;) {
                resize[i](term);
            }
        },
        onBlur: function() {
            return false;
        },
        convertLinks: true
    });
});
