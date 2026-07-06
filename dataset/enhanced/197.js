setcpm(105/4)

$: s("bd ~ [lt lt] ~ bd ~ lt*2 ~").gain(.75)

$: s("cymbal ~").slow(2).gain(.25).room(.5)

$: note("d5 eb5 d5 a4").s("sawtooth").lpf(2200).release(.2).delay(.35).gain(.3)

$: note("<d3 c3>").s("<gm_electric_guitar_clean:2 gm_overdriven_guitar:6>").slow(2).gain(.4).room(.4)

$: note("d2 ~ d2 c2").s("square").lpf(500).release(.15).gain(.5)
