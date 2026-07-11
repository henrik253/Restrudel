setcpm(96/4)
$: s("bd ~ ~ ~").slow(2).gain(.7)
$: n("0 2 4 0 ~ 2 4 0").scale("a2:major").struct("x*3").add("<0 .02>").s("sawtooth").gain(.4)
$: s("hh*8").gain(.2)
