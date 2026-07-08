setcpm(100/4)

$: s("gm_electric_bass_finger:2 piano").lpf(4386).hpf(100).resonance(2).room(1.2).delay(.5).gain("[1 0.7 0.8 0.6]*2")

$: note(12).sound("bd*2 ~").lpf(650).room(.35).gain(.3)
