setcpm(110)

$: s("gm_piano gm_recorder").velocity(.15).gain(.5)
$: note("g#4@2 g#4").sound("drums kick").lpf(2501).hpf(8000).gain(.5)
$: s("gm_electric_bass_pick gm_electric_guitar_jazz").gain(.5)
$: n("7 10!2 7!2 14!2 ~ 7").velocity(.6831).room(.8).gain(.5)
