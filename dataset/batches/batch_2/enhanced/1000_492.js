setcpm(90/4)
$: note("b1 f#2 f2 bb1").s("sawtooth").gain(.35)
$: note("c3 d3 e3 f3").velocity(.78).pan(.3).room(.3).delay(.3).delaytime(.12).gain(.4).s("triangle")
$: s("bd ~ sd ~").bank("RolandTR909").gain(.7)
