// Prime number generation up to n
// helper function to replace list of primes
// given in the codewars.com problem
function generatePrimes(n) {
  const primes = [2];
  for (let i = 3; i <= n; i += 2) {
    if (primes.every(prime => i % prime !== 0)) {
      primes.push(i);
    }
  }
  return primes;
}

// helper function for prime number check
// used in chekcing if path is valid in visualization
// numbers are small enough that this terrible code is fine
function isPrime(num) {
  for (let i = 2; i * i <= num; i++)
    if (num % i === 0) return false;
  return num > 1;
}

// helper function for sum visualization
function computeSum(seq, path) {
  let sum = 0;
  // ignore end node, if any
  // end node has type string
  path.forEach((id) => {
    if (typeof seq[id] === "number") {
      sum += seq[id];
    }
  });
  return sum;
}

// helper function to count the number of elements
// in the DAG nested array
function nestedArrSize(arr) {
  let count = 0;
  arr.forEach(element => {
      if (Array.isArray(element)) {
          count += nestedArrSize(element);
      } else {
          count++;
      }
  });
  return count;
}


// helper function for linking nodes with path arcs
// in visualization
function linkArc(path) {
  if (path === undefined || path.length < 2) {
    return [];
  }
  let dSize = Math.max(...path) + 1;
  const d = Array(dSize).fill().map(() => []);
  for (let i = 0; i < path.length - 1; i++) {
    d[path[i]].push(path[i + 1]);
  }
  return d;
}

// helper function to show what linking every node
// to every other looks like
function linkAll(seq) {
  const d = Array(seq.length + 1).fill().map(() => []);
  for (let i = 0; i < seq.length; i++) {
    for (let j = i + 1; j < seq.length; j++) {
      d[i].push(j);
    }
  }
  return d;
}

// The directed acyclic graph generator 
// used in solving the problem via finding
// all valid connections
function dag(seq) {
  const d = Array(seq.length + 1).fill().map(() => []);
  const PRIMES = generatePrimes(seq.length);

  for (let i = 0; i < seq.length; i++) {
    PRIMES.filter(k => k < seq.length - i)
      .forEach(j => {
        d[i].push(i + j);
      });
    d[i].push(seq.length);  // add a terminal node
  }
  console.log("seq", seq);
  console.log("dag size", nestedArrSize(d));
  return d;
}

// The max_path dynamic programming function
function max_path(d, seq) {
  const n = seq.length;
  let max_sum = [...seq]; // Copy of seq array to avoid overwriting
  let best_path = Array.from({ length: n }, (_, i) => [i]); // Initialize an array for storing paths

  for (let node = n - 1; node >= 0; node--) {
    if (d[node].length > 0) {
      let max_val = Number.NEGATIVE_INFINITY;
      let max_node = -1;
      for (let next_node of d[node]) {
        if (max_sum[next_node] > max_val) {
          max_val = max_sum[next_node];
          max_node = next_node;
        }
      }
      max_sum[node] = max_val + seq[node];
      best_path[node] = [node].concat(best_path[max_node]);
    }
  }

  let max_sum_start = Math.max(...max_sum);  // maximum sum among all starting nodes
  let start_node = max_sum.indexOf(max_sum_start);  // starting node for the maximum sum
  let path = best_path[start_node];  // path corresponding to the maximum sum
  // console.log("Inside The maximum sum is " + max_sum_start);
  // console.log("Inside The path is " + path);
  return [max_sum_start, path];
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  

// The prime_grasshopper function
// this is how the codewars.com problem is solved
function prime_grasshopper(seq) {
  const d = dag(seq);
  seq.push(0);
  const [max_sum, path] = max_path(d, seq);
  seq.pop();
  return [Math.max(max_sum, 0), path];
}

