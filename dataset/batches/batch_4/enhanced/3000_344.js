setcpm(80)

$: n(5).slow(2).gain(.5)
$: s("hh 8").gain("[1 0.5]*4")
$: n("0 1 2 3").sound("supersaw sawtooth ~ hh").lpf(300).gain(.5)
