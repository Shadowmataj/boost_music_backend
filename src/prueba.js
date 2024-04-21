import moment from "moment";

const pepe = [
    {
        id: 1,
        code:"jfkdlaj",
    },
    {
        id: 2,
        code:"jfkdlaj",
    },
    {
        id: 3,
        code:"jfodlaj",
    },
]

const index = pepe.findIndex(item => item.id === 3)

console.log(index)