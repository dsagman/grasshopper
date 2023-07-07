function generatePrimes(n) {
  // Prime number generation up to n
  // helper function to replace list of primes
  // given in the codewars.com problem
  const primes = [2];
  for (let i = 3; i <= n; i += 2) {
    if (primes.every(prime => i % prime !== 0)) {
      primes.push(i);
    }
  }
  return primes;
}

function isPrime(num) {
  // helper function for prime number check
  // used in chekcing if path is valid in visualization
  // numbers are small enough that this terrible code is fine
  for (let i = 2; i * i <= num; i++)
    if (num % i === 0) return false;
  return num > 1;
}

function computeSum(seq, path) {
  // helper function for sum visualization
  let sum = 0;
  // ignore end node, end node has type string
  path.forEach((id) => {
    if (typeof seq[id] === "number") {
      sum += seq[id];
    }
  });
  return sum;
}

function nestedArrSize(arr) {
  // helper function to count the number of elements
  // in the DAG nested array
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


function linkArc(path) {
  // helper function for linking nodes with path arcs
  // in visualization
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

function linkAll(seq) {
  // helper function to show what linking every node
  // to every other looks like
  const d = Array(seq.length + 1).fill().map(() => []);
  for (let i = 0; i < seq.length; i++) {
    for (let j = i + 1; j < seq.length; j++) {
      d[i].push(j);
    }
  }
  return d;
}
function dag(seq) {
  // The directed acyclic graph generator used in solving 
  // the problem via finding all valid connections
  const d = Array(seq.length + 1).fill().map(() => []);
  const PRIMES = generatePrimes(seq.length);

  for (let i = 0; i < seq.length; i++) {
    PRIMES.filter(k => k < seq.length - i)
      .forEach(j => {
        d[i].push(i + j);
      });
    d[i].push(seq.length);  // add a terminal node
  }
  console.log("seq size", seq.length);
  console.log("dag size", nestedArrSize(d));
  return d;
}

function max_path(d, seq) {
  // The dynamic programming function for best path and max sum
  const n = seq.length;
  let max_sum = [...seq]; // Copy of seq array to avoid overwriting
  let best_path = Array.from({ length: n }, (_, i) => [i]); // Initialize an array for storing paths
  let logPath = [];
  
  for (let node = n - 1; node >= 0; node--) {
    console.log("node", node);
    if (d[node].length > 0) {
      let max_val = Number.NEGATIVE_INFINITY;
      let max_node = -1;
      for (let next_node of d[node]) {
        console.log("max node", max_node);
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
  console.log("Inside The maximum sum is " + max_sum_start);
  console.log("Inside The path is " + path);
  console.log("best path is " + best_path);
  console.log("max sum is " + max_sum);
  return [max_sum_start, path];
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  

function prime_grasshopper(seq) {
  // The prime_grasshopper function for the codewars.com problem is solved
  const d = dag(seq);
  seq.push(0);
  const [max_sum, path] = max_path(d, seq);
  seq.pop();
  return [Math.max(max_sum, 0), path];
}

