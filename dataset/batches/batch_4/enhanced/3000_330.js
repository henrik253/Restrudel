setcpm(110)

$: note("a2*8 a2*4 ~ ~").sound("piano sine").gain(.5)
$: n("0 7").scale("C3 major").attack(1).gain(0.30)
$: s("square noise*16").lpf(2500).room(1.137).gain(.5)
