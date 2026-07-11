setcpm(112/4)

$: note("a4 d#5@2 ~ a4").s("hh").gain(.6)

$: s("gm_synth_strings_1 gm_piccolo").gain(.35)

$: n(7).scale("g4:dorian").s("gm_oboe").clip(.18).release(.1).attack(.06).gain(.4)

$: note("c3 g2 a2 f2 c3 g2 f2 c3").s("sawtooth").lpf(513).hpf(7000).room(.8131).gain(.35)
