setcpm(100)

$: s("kick snare ~ snare").release(.1).attack(.0619).decay(.03).sustain(0).bank("AkaiLinn").room(1.1125).bank("RolandTR909").gain(.8)

$: s("gm_synth_strings_1 3").velocity(.3).gain(.5)

$: s("lead hh!7").slow(2).gain(.2)

$: note("a2 c3 f3 a3 c4 f4 c4 e4 g4 c5 g3 b3 d4 g4 a3 c4 e4").s("misc:2 num vocal 1").slow(2).lpf(1500).gain(.4)
