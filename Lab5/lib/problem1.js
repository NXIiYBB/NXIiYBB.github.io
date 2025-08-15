function validateInput(input) {
    const num = Number(input);
    return Number.isInteger(num) && num > 0;
}

function findPrimes(limit) {
    const primes = [];
    for (let n = 2; n <= limit; n++) {
        let isPrime = true;
        for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) { isPrime = false; break; }
        }
        if (isPrime) primes.push(n);
    }
    return primes;
}

function displayPrimes(primes, limit) {
    if (primes.length === 0) {
        alert(`For n = ${limit} prime number is empty`);
    } else {
    alert(`For n = ${limit} prime numbers are ${primes.join(", ")}`);
    }
}

let num;
do { num = prompt("Enter a positive integer"); }
while (!validateInput(num));

const primes = findPrimes(Number(num));
displayPrimes(primes, num);