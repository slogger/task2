var createStore = function (reducer, initialState) {
    if (typeof reducer !== 'function') {
        throw new Error('Expected the reducer to be a function.');
    }
    var currentState = initialState;
    var currentReducer = reducer;
    var listeners = [];

    var getState = () => {
        return currentState;
    };

    var dispatch = (action) => {
        currentState = currentReducer(currentState, action);
        listeners.forEach(function (listener) {
            listener();
        });
        return action;
    };

    var subscribe = (listener) => {
        listeners.push(listener);
        return function () {
            listeners = listeners.filter(l => {
                return l !== listener;
            });
        };
    };

    return { 'getState': getState, 'dispatch': dispatch, 'subscribe': subscribe };
};
