



const exampleNumbersA = [1,2,3]

const exampleNumbersB = [4,5,6]

const combinedNumbersArray = exampleNumbersA.concat(exampleNumbersB)

console.log(combinedNumbersArray)

const employeesA = [
    {
        id: 1,
        name: 'John'
    },
    {
        id: 2,
        name: 'Jim'
    },
    {
        id: 3,
        name: 'Ted'
    },
]

const employeesB = [
    {
        id: 1,
        name: 'Joe'
    },
    {
        id: 2,
        name: 'Marco'
    },
    {
        id: 3,
        name: 'Pete'
    },
]

const combinedObjects = employeesA.concat(employeesB)

console.log(combinedObjects)


employeesA.forEach((employee, index) =>{
    console.log(`At Index, ${index}:`, employee)
})

const numbers = [1,2,3,4,5];

const joinedNumbers = numbers.join(', ')

console.log(joinedNumbers)

const success = 'I Will IYH Succeed To Become A Good Skilled Programer!'
const successParts = success.split(' ')
console.log(successParts)
const successString = successParts.join(' ');

console.log(successString)




 