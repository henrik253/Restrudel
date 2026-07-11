setcpm(120/4)

$: s("~ bd*2").bank("RolandTR808").gain(.8)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.7)

$: note("a2 a3 c3 f3 a3 c4").sound("drums").lpf(2000).room(.5).gain(.5)

$: n("0 -3 2 -1 -4 0").scale("c4:minor").s("sawtooth").lpf(1000).gain(.35)
