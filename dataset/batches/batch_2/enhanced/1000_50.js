setcpm(100/4)

$: s("bd ~ ~ ~").bank("RolandTR909").gain(.8)

$: s("~ hh ~ hh").gain(.2)

$: note("c1 f1 c1 f1").sound("sine").lpf(sine.range(400,1400).slow(4)).room(.4645).gain(.4)

$: note("c3 f3").sound("sawtooth").slow(2).lpf(1200).room(.4).gain(.25)
