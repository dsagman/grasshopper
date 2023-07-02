
# https://www.codewars.com/kata/5a24a35a837545ab04001614/train/python
import codewars_test as test
from primePy import primes
PRIMES = primes.upto(5003)

def dag(seq):
    # build directed acyclic graph
    d = {k: [] for k in range(len(seq)+1)} # add a terminal node
    for i in range(len(seq)):
        for j in [k for k in PRIMES if k < len(seq)-i]: 
            d[i].append(i+j)
        d[i].append(len(seq)) # add a terminal node
    return d

def max_path(d, seq):
    n = len(seq)
    max_sum = seq[:] # initialize an array for storing maximum sums

    for node in range(n - 1, -1, -1):
        if d[node]:
            max_val = float('-inf')
            for next_node in d[node]:
                if max_sum[next_node] > max_val:
                    max_val = max_sum[next_node]
            max_sum[node] = max_val + seq[node]

    max_sum_start = max(max_sum)  # maximum sum among all starting nodes

    return max_sum_start

def prime_grasshopper(seq):
    d = dag(seq)
    seq.append(0) # add a terminal node 
    max_sum = max_path(d, seq)
    return max(max_sum,0) 

@test.it("Small fixed tests")
def tests():
    test.assert_equals(prime_grasshopper([2, 3, 4, 5, 6]), 12)
    test.assert_equals(prime_grasshopper([1, 2, 3, 4, 5, 6]), 12)
    test.assert_equals(prime_grasshopper([-10, 3, 4, 5, 6]), 10) 
    test.assert_equals(prime_grasshopper([3, 4, 5, 6, -10]), 10)    
    test.assert_equals(prime_grasshopper([-5, -4, -3, -2, -1]), 0, "There is no good place to land, skip the entire array!")     
    test.assert_equals(prime_grasshopper([-5, 4, 5, 2, 1]), 6) 
    test.assert_equals(prime_grasshopper([-5, 5, 4, -2, -2, 3, -7]), 7, "The largest number is not guaranteed to be a good landing spot") 
    test.assert_equals(prime_grasshopper([8, 2, 0, -2, -3, -2, -3, -1, 9]), 15, "Sometimes you have to land on a 'bad' item to succeed") 
    
    
@test.it("Medium fixed tests")
def tests():
    test.assert_equals(prime_grasshopper([100] + [-1] * 166 + [100]), 200, "Jumps can be quite large (167 is a prime number).")
    test.assert_equals(prime_grasshopper([100] + [-1] * 442 + [100]), 200, "Jumps can be quite large (443 is a prime number).")
    test.assert_equals(prime_grasshopper([100] + [-1] * 852 + [100]), 200, "Jumps can be quite large (853 is a prime number).")
    test.assert_equals(
        prime_grasshopper([-2, -28, -21, -71, -23, -58, 17, -18, 47, -47, 49, -80, -58, -56, -27, 94, -66, 4, 56, 90, -93, 73, -5, 49, 19, -33, -8, 30, 59, -1, 71, 64, 42, 79, 23, -51, 78, -34, 86, -9, -87, 5, -80, -100, -90, -56, -99, -75]),
        801) 
    test.assert_equals(
        prime_grasshopper([-71, -52, -62, -4, -57, -76, -24, 72, 46, 5, 3, 58, -40, 6, 89, -91, -49, 2, -51, 22, 96, -22, 29, 55, -37, 53, 77, -98, 67, 24, 21, -74, 24, 14, 54, 58, 0, 32, -30, -25, -88, -19, -70, 19]),
        656) 
    test.assert_equals(
        prime_grasshopper([-78, -10, -80, -96, -49, 46, 18, -79, 73, -65, 25, -43, 55, -22, -29, -76, -94, -80, 70, -2, -53, 2, -33, -30, 46, -57, 84, 90, 84, -62, 83, 17, 96, -57, 8, -43, 75, 85, -92, -9, 47, -73, -33, -20, -13]),
        732) 
    test.assert_equals(
        prime_grasshopper([-22, -35, -86, -6, -34, -28, -4, 89, -67, -44, 33, 63, -3, 20, 68, -72, -3, 29, 47, 57, 12, -74, -84, -86, 37, 25, 83, 4, 30, 25, 56, 61, -96, -12, -8, 65, -48, -30, -60, -9, 14, -83, 39, -37, 17, -65, -86]),
        614) 
    test.assert_equals(
        prime_grasshopper([-67, 74, 45, -58, 69, 16, -53, -35, 19, 12, 28, -63, -2, 3, 51, -90, 99, -62, 33, 15, 26, -94, 89, 94, -18, 27, 88, -89, 63, 54, -99, 65, -91, 0, -99, -15, 4, -70, 95, -18, -86, -15]),
        773) 
    test.assert_equals(
        prime_grasshopper([-33, -8, -78, -36, -39, -83, -53, 60, 97, -84, -7, 62, 22, 96, 54, 73, -100, 70, 33, -34, 50, -96, 37, 57, 59, 48, -2, -37, -33, -19, 79, -36, -6, 57, 93, -71, -93, -75, -84, -53, 79, 18, 86, -40, -23]),
        854) 
    test.assert_equals(
        prime_grasshopper([-49, -49, -53, -42, -53, -44, 69, 88, 11, -74, 66, 42, -38, -67, -25, -10, -17, 86, -79, 91, 13, -30, -11, 60, -56, 75, -32, 14, 95, -35, -42, 37, 40, 52, 99, -45, 79, 94, 31, -73, -49, 26, -41, 29, -48]),
        832) 
    test.assert_equals(
        prime_grasshopper([-49, -20, 50, 59, -7, 46, -21, -57, 87, -40, 92, 62, -20, 87, -87, 62, 72, -2, 53, 94, 32, -42, -51, -43, 31, -93, 34, -22, 41, 56, -49, -9, -1, -80, -29, 82, -78, -64, 66, -74, -60, 44, -73, -58, -11]),
        849) 
    test.assert_equals(
        prime_grasshopper([-20, -57, 79, 33, 49, -23, 45, -52, 79, 83, 6, -49, -50, -2, -91, -33, -8, 16, 38, -12, -50, 46, 34, -85, -24, 27, -98, 83, -90, -17, 74, -55, 74, -37, -7, -31, -7, -25, -28, 16, -92, 94, -41, -90, -9, -87, -92]),
        676) 
    test.assert_equals(
        prime_grasshopper([-41, -8, -27, -49, -35, 12, -24, -90, 62, -64, 94, -67, -24, 82, 46, 45, -93, -99, -38, 28, -45, -7, 13, -16, -97, 53, 45, 59, 68, -50, -49, 56, 52, 21, 17, -49, -55, -43, 99, -5, -39, 33, 56, -51, 84, -52, -2, -69, -23]),
        722) 