setcpm(110)

$: s("bd ~ sd ~").gain(.7)
$: s("hh*8").gain(.2)
$: n("0 2 4 5").scale("c:major").s("sine").lpf(1500).gain(.3).room(.4)
