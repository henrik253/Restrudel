setcpm(128/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: note("a3 d5 c#5 c5").s("sawtooth").lpf(2500).room(.5).release(.15).gain("[.4 .3]*2")

$: note("<d2 [d2 f2]>").s("gm_overdriven_guitar:6").lpf(800).gain(.4).room(.7).slow(2)

$: s("~ ~ ~ vibraslap").slow(2).gain(.3)
