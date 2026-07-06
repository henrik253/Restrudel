setcpm(104/4)

$: note("c2 ~ f2 ~ c2 c2 f2 ~").s("gm_electric_bass_pick").release(.2).gain(.5)

$: s("bd ~ sd ~").bank("AkaiLinn").gain(.75)

$: s("~ ~ ~ vibraslap").slow(2).gain(.25)

$: n("0 ~ 2 ~ 4 ~ [2 1] ~").scale("f:major").s("sawtooth").lpf(1200).release(.2).gain(.3)

$: s("hh*8").gain(.15)
