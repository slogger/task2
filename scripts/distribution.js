(function() {
    'use strict';
    /**
     * @param {Object} state
     * @param {Object} matchingAlgoritm with `compute` method
     * @return {Object} mentors and distributed them students
     */

    const Distribution = (state, matchingAlgoritm) => {
        let unsetStudents = state.students;
        let mentorsSetup = new Map()

        const find = (users, id) => {
            return users.filter(user => user.id === id)[0]
        }

        state.mentors.forEach(mentor => {
            mentorsSetup.set(mentor, new Set())
        })

        // пока есть студенты без ментора
        while (unsetStudents.length) {
            // строю матрицу весов
            let costMatrix = [];
            state.mentors.forEach(mentor => {
                let row = []
                unsetStudents.forEach(student => {
                    let cost = 3
                    if (mentor.prior.indexOf(student.id) + 1 != 0) {
                        cost -= 1
                    }
                    if (student.prior.indexOf(mentor.id) + 1 != 0) {
                        cost -= 0.5
                    }
                    row.push(cost)
                })
                costMatrix.push(row)
            })
            // прогоняю венгерский алгоритм
            let matching = matchingAlgoritm.compute(costMatrix)
            // запоминаю назначенные пары
            matching.forEach(pair => {
                let mentor = find(state.mentors, pair[0])
                let student = unsetStudents[pair[1]]
                let currentMentorSetup = mentorsSetup.get(mentor);
                if (student) {
                    mentorsSetup.set(mentor, currentMentorSetup.add(student))
                    unsetStudents = unsetStudents.filter(_student => _student !== student)
                }
            })
        }
        return mentorsSetup
    }

    window.distribution = Distribution;
}());
