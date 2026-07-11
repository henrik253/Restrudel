setcpm(100)

$: note("c5 g3 b3").lpf(1500).gain(.4)

$: n("c2 ~ f2 ~ 10 4").scale("C:ritusen").transpose(3).s("misc:2 sawtooth").gain(.4).lpf(1500).gain(.4)

$: n("0 -7!8 9!2 6 7").clip("<1@3 [.3 1]>/2").s("bd 1").bank("RolandTR909").gain(.8)

$: s("gm_lead_6_voice rhodes").release(1.4367).delay(.5).gain(.8722).lpf(1500).gain(.4)
