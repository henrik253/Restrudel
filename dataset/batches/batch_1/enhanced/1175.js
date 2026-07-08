setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain(.15).pan(.4)

$: note("c3 g3 c4 g3").s("triangle").lpf(406).release(.3).room(.5).delay(.25).delaytime(.125).delayfeedback(.4).gain(.4)

$: note("<c2 g1 ab1 bb1>").s("sawtooth").lpf(600).release(.3).gain(.5)
