setcpm(110/4)
$: s("bd ~ sd ~").bank("RolandTR808").gain(.8)
$: n("0 3 7 ~").scale("g:minor").s("sawtooth").gain(.4).delay(.2).delayfeedback(.4).lpf(1500)
$: s("lt ht").slow(2).gain(.3)
