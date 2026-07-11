setcpm(110)

$: n("5 3").scale("major").transpose(-8).s("gm_acoustic_guitar_steel:2 gm_overdriven_guitar:6").gain(.5)
$: note("a2*8 ~ ~ a2*8 a2*8 a2*8 a2*8 a2*8").sound("kick snare").lpf(1887).velocity(.3).hpf(500).gain(0.50).pan(.55)
$: s("gm_overdriven_guitar:3 gm_drawbar_organ:4").gain(.5)
$: s("kick*4 bd:0 bd:1 bd:2").gain(0.55)
