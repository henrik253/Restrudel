setcpm(105/4)
$: s("bd sd").lpf(650).room(.4).gain(.7)
$: n("F4 A3 Gb4 Bb3 E4").s("triangle").lpf(1500).gain(.3)
$: note("d4 e4 ~ g4").struct("x*4").gain(.35).release(.15)
