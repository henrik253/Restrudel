setcpm(122/4)

$: s("bd*2 ~ cp ~").bank("RolandTR808").gain(.8)

$: s("~ hh ~ hh").gain(.18).pan(.5)

$: note("c5 e5 g5 d6").s("sine").lpf("<1500 1800 2400>").room(.6).release(.2).gain(.4)

$: note("<f2 d2 a1 c2>").s("sawtooth").lpf(600).release(.3).gain(.5)
