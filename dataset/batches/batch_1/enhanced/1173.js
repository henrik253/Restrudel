setcpm(116/4)

$: s("bd*3 sd*2").bank("RolandTR909").gain(.3).room(.5)

$: s("hh*8").gain(.18).pan(.5)

$: note("d4 d#4 ~ ~ d#4 f4@2 g4 f4 d#4 f4 d#4@2 ~ ~ d#4 f4").s("sawtooth").lpf(3504).release(.2).room(.4).gain(.4)

$: note("<d2 a1 bb1 c2>").s("square").lpf(650).release(.3).gain(.5)
