setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ hh ~ hh").gain(.18)

$: note("f4 c4").s("sawtooth").lpf(1305).hpf(800).room(.5).delay(.4).delaytime(.31).delayfeedback(.5).gain(.4)

$: note("a#5 g#5 c#4 e4 b4 d#5 c#4 g#3").s("square").lpf(4000).room(.3).gain(.35)

$: note("c2 ~ f2 ~").s("sawtooth").lpf(500).release(.2).gain(.4)
