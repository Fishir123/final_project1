import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(const JimpitanMobileApp());
}

const String defaultApiUrl = String.fromEnvironment(
  'API_URL',
  defaultValue: 'http://10.0.2.2:3002',
);

class AppUser {
  final int id;
  final String nama;
  final String email;
  final String role;
  final String? noHp;
  final Map<String, dynamic>? warga;

  AppUser({
    required this.id,
    required this.nama,
    required this.email,
    required this.role,
    this.noHp,
    this.warga,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] ?? 0,
      nama: json['nama'] ?? '-',
      email: json['email'] ?? '-',
      role: json['role'] ?? 'warga',
      noHp: json['no_hp'],
      warga: json['warga'] is Map<String, dynamic> ? json['warga'] : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'nama': nama,
        'email': email,
        'role': role,
        'no_hp': noHp,
        'warga': warga,
      };
}

class ApiService {
  final String baseUrl;
  String? token;

  ApiService({required this.baseUrl, this.token});

  Uri uri(String path) => Uri.parse('$baseUrl$path');

  Map<String, String> get headers => {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  Future<Map<String, dynamic>> request(
    String path, {
    String method = 'GET',
    Map<String, dynamic>? body,
  }) async {
    late http.Response response;
    final target = uri(path);

    if (method == 'POST') {
      response = await http.post(target, headers: headers, body: jsonEncode(body ?? {}));
    } else if (method == 'PUT') {
      response = await http.put(target, headers: headers, body: jsonEncode(body ?? {}));
    } else if (method == 'DELETE') {
      response = await http.delete(target, headers: headers);
    } else {
      response = await http.get(target, headers: headers);
    }

    final text = response.body;
    final data = text.isNotEmpty ? jsonDecode(text) : <String, dynamic>{};

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(data['message'] ?? 'Terjadi kesalahan');
    }

    return data is Map<String, dynamic> ? data : <String, dynamic>{'data': data};
  }

  Future<Map<String, dynamic>> login(String email, String password) {
    return request('/api/login', method: 'POST', body: {'email': email, 'password': password});
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> payload) {
    return request('/api/register', method: 'POST', body: payload);
  }

  Future<List<dynamic>> getWargaIuran() async => (await request('/api/warga/iuran'))['data'] ?? [];
  Future<List<dynamic>> getWargaPembayaran() async => (await request('/api/warga/iuran/pembayaran'))['data'] ?? [];
  Future<Map<String, dynamic>> createQrisPayment(int id) => request('/api/warga/iuran/$id/bayar-qris', method: 'POST');
  Future<Map<String, dynamic>> syncPayment(String orderId) => request('/api/warga/iuran/pembayaran/$orderId/sync', method: 'POST');
  Future<Map<String, dynamic>> getLaporanWarga() => request('/api/warga/laporan');
  Future<List<dynamic>> getUsulanWarga() async => (await request('/api/warga/usulan'))['data'] ?? [];
  Future<Map<String, dynamic>> createUsulan(Map<String, dynamic> payload) => request('/api/warga/usulan', method: 'POST', body: payload);

  Future<Map<String, dynamic>> getLaporanAdmin() => request('/api/admin/laporan');
  Future<List<dynamic>> getAdminIuran() async => (await request('/api/admin/iuran'))['data'] ?? [];
  Future<Map<String, dynamic>> createAdminIuran(Map<String, dynamic> payload) => request('/api/admin/iuran', method: 'POST', body: payload);
  Future<Map<String, dynamic>> updateAdminIuran(int id, Map<String, dynamic> payload) => request('/api/admin/iuran/$id', method: 'PUT', body: payload);
  Future<void> deleteAdminIuran(int id) async => request('/api/admin/iuran/$id', method: 'DELETE');
  Future<List<dynamic>> getAdminUsulan() async => (await request('/api/admin/usulan'))['data'] ?? [];
  Future<Map<String, dynamic>> updateAdminUsulan(int id, Map<String, dynamic> payload) => request('/api/admin/usulan/$id/status', method: 'PUT', body: payload);
}

class JimpitanMobileApp extends StatefulWidget {
  const JimpitanMobileApp({super.key});

  @override
  State<JimpitanMobileApp> createState() => _JimpitanMobileAppState();
}

class _JimpitanMobileAppState extends State<JimpitanMobileApp> {
  final ApiService api = ApiService(baseUrl: defaultApiUrl.replaceAll(RegExp(r'/$'), ''));
  AppUser? user;
  bool booting = true;

  @override
  void initState() {
    super.initState();
    loadSession();
  }

  Future<void> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final savedToken = prefs.getString('token');
    final savedUser = prefs.getString('user');

    if (savedToken != null && savedUser != null) {
      api.token = savedToken;
      user = AppUser.fromJson(jsonDecode(savedUser));
    }

    setState(() => booting = false);
  }

  Future<void> saveSession(String token, AppUser user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    await prefs.setString('user', jsonEncode(user.toJson()));
    api.token = token;
    setState(() => this.user = user);
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    api.token = null;
    setState(() => user = null);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Jimpitan Digital',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff2563eb)),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xffeef4ff),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
          filled: true,
          fillColor: Colors.white,
        ),
      ),
      home: booting
          ? const Scaffold(body: Center(child: CircularProgressIndicator()))
          : user == null
              ? AuthScreen(api: api, onLoggedIn: saveSession)
              : user!.role == 'admin'
                  ? AdminHome(api: api, user: user!, onLogout: logout)
                  : WargaHome(api: api, user: user!, onLogout: logout),
    );
  }
}

class LogoHeader extends StatelessWidget {
  final String title;
  final String subtitle;

  const LogoHeader({super.key, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: Image.asset('assets/images/logo-jimpitan.png', width: 58, height: 58, fit: BoxFit.cover),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Jimpitan Digital', style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.w900, fontSize: 12)),
              Text(title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 26)),
              Text(subtitle, style: const TextStyle(color: Colors.black54)),
            ],
          ),
        ),
      ],
    );
  }
}

class AppCard extends StatelessWidget {
  final Widget child;
  const AppCard({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white.withValues(alpha: .94),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xffdbe3ef))),
      child: Padding(padding: const EdgeInsets.all(18), child: child),
    );
  }
}

class AuthScreen extends StatefulWidget {
  final ApiService api;
  final Future<void> Function(String token, AppUser user) onLoggedIn;

  const AuthScreen({super.key, required this.api, required this.onLoggedIn});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool registerMode = false;
  bool loading = false;
  final nama = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();
  final noHp = TextEditingController();
  final nik = TextEditingController();
  final alamat = TextEditingController();
  final rtRw = TextEditingController();
  String role = 'warga';

  @override
  void dispose() {
    nama.dispose();
    email.dispose();
    password.dispose();
    noHp.dispose();
    nik.dispose();
    alamat.dispose();
    rtRw.dispose();
    super.dispose();
  }

  Future<void> submit([NavigatorState? dialogNavigator, VoidCallback? refresh]) async {
    if (mounted) {
      setState(() => loading = true);
      refresh?.call();
    }

    try {
      if (registerMode) {
        await widget.api.register({
          'nama': nama.text,
          'email': email.text,
          'password': password.text,
          'no_hp': noHp.text,
          'role': role,
          'nik': nik.text,
          'alamat': alamat.text,
          'rt_rw': rtRw.text,
        });
        if (mounted) {
          setState(() => registerMode = false);
          refresh?.call();
          showSnack(context, 'Registrasi berhasil, silakan login');
        }
      } else {
        final result = await widget.api.login(email.text, password.text);
        if (dialogNavigator != null && dialogNavigator.canPop()) {
          dialogNavigator.pop();
        }
        await widget.onLoggedIn(result['token'], AppUser.fromJson(result['user']));
      }
    } catch (e) {
      if (mounted) showSnack(context, e.toString().replaceFirst('Exception: ', ''), error: true);
    } finally {
      if (mounted) {
        setState(() => loading = false);
        refresh?.call();
      }
    }
  }

  void openAuthDialog(bool isRegister) {
    setState(() => registerMode = isRegister);

    showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            void refresh() {
              if (context.mounted) setModalState(() {});
            }

            return Dialog(
              insetPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 24),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 520),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(18),
                  child: authForm(
                    dialogNavigator: Navigator.of(dialogContext),
                    refresh: refresh,
                    onClose: () => Navigator.of(dialogContext).pop(),
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget authForm({NavigatorState? dialogNavigator, VoidCallback? refresh, VoidCallback? onClose}) {
    void changeMode(bool value) {
      setState(() => registerMode = value);
      refresh?.call();
    }

    return Stack(
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.only(right: 42),
                child: LogoHeader(
                  title: registerMode ? 'Register' : 'Login',
                  subtitle: 'Masuk untuk mengakses Jimpitan Digital',
                ),
              ),
              const SizedBox(height: 22),
              SegmentedButton<bool>(
                segments: const [
                  ButtonSegment(value: false, label: Text('Login')),
                  ButtonSegment(value: true, label: Text('Register')),
                ],
                selected: {registerMode},
                onSelectionChanged: loading ? null : (v) => changeMode(v.first),
              ),
              const SizedBox(height: 18),
              if (registerMode) ...[
                TextField(controller: nama, decoration: const InputDecoration(labelText: 'Nama')),
                const SizedBox(height: 12),
              ],
              TextField(controller: email, decoration: const InputDecoration(labelText: 'Email'), keyboardType: TextInputType.emailAddress),
              const SizedBox(height: 12),
              TextField(controller: password, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
              if (registerMode) ...[
                const SizedBox(height: 12),
                TextField(controller: noHp, decoration: const InputDecoration(labelText: 'No HP')),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: role,
                  decoration: const InputDecoration(labelText: 'Role'),
                  items: const [
                    DropdownMenuItem(value: 'warga', child: Text('Warga')),
                    DropdownMenuItem(value: 'admin', child: Text('Admin')),
                  ],
                  onChanged: loading
                      ? null
                      : (v) {
                          setState(() => role = v ?? 'warga');
                          refresh?.call();
                        },
                ),
                if (role == 'warga') ...[
                  const SizedBox(height: 12),
                  TextField(controller: nik, decoration: const InputDecoration(labelText: 'NIK')),
                  const SizedBox(height: 12),
                  TextField(controller: alamat, decoration: const InputDecoration(labelText: 'Alamat'), minLines: 2, maxLines: 3),
                  const SizedBox(height: 12),
                  TextField(controller: rtRw, decoration: const InputDecoration(labelText: 'RT/RW')),
                ],
              ],
              const SizedBox(height: 18),
              FilledButton(
                onPressed: loading ? null : () => submit(dialogNavigator, refresh),
                style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(52)),
                child: Text(loading ? 'Memproses...' : registerMode ? 'Daftar' : 'Login'),
              ),
            ],
          ),
        ),
        if (onClose != null)
          Positioned(
            top: 0,
            right: 0,
            child: IconButton.filledTonal(
              onPressed: loading ? null : onClose,
              icon: const Icon(Icons.close),
              tooltip: 'Tutup',
            ),
          ),
      ],
    );
  }

  Widget landingFeature(IconData icon, String title, String description) {
    return AppCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(color: const Color(0xffeff6ff), borderRadius: BorderRadius.circular(14)),
            child: Icon(icon, color: Theme.of(context).colorScheme.primary),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                const SizedBox(height: 4),
                Text(description, style: const TextStyle(color: Colors.black54, height: 1.45)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(18),
                  child: Image.asset('assets/images/logo-jimpitan.png', width: 52, height: 52, fit: BoxFit.cover),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Jimpitan Digital', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                      Text('Transparansi iuran warga', style: TextStyle(color: Colors.black54)),
                    ],
                  ),
                ),
                TextButton(onPressed: () => openAuthDialog(false), child: const Text('Login')),
              ],
            ),
            const SizedBox(height: 34),
            Text('Aplikasi Warga', style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.w900, letterSpacing: 1.2)),
            const SizedBox(height: 10),
            const Text(
              'Kelola jimpitan, laporan, dan usulan warga lebih mudah.',
              style: TextStyle(fontSize: 34, height: 1.05, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 14),
            const Text(
              'Jimpitan Digital membantu admin mencatat pemasukan dan pengeluaran, sementara warga bisa melihat laporan keuangan serta mengirim usulan kebutuhan desa.',
              style: TextStyle(fontSize: 16, height: 1.6, color: Colors.black54),
            ),
            const SizedBox(height: 22),
            FilledButton(
              onPressed: () => openAuthDialog(true),
              style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(52)),
              child: const Text('Mulai Daftar'),
            ),
            const SizedBox(height: 10),
            OutlinedButton(
              onPressed: () => openAuthDialog(false),
              style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
              child: const Text('Masuk Akun'),
            ),
            const SizedBox(height: 22),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Container(width: 10, height: 10, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)),
                    const SizedBox(width: 8),
                    const Text('Ringkasan Keuangan', style: TextStyle(fontWeight: FontWeight.w900)),
                  ]),
                  const SizedBox(height: 14),
                  metric('Pemasukan', 2500000),
                  metric('Pengeluaran', 750000),
                  metric('Saldo', 1750000),
                ],
              ),
            ),
            const SizedBox(height: 12),
            landingFeature(Icons.payments, 'Catat Keuangan', 'Admin dapat mengelola data pemasukan dan pengeluaran warga.'),
            landingFeature(Icons.bar_chart, 'Laporan Transparan', 'Warga bisa melihat ringkasan laporan keuangan secara mudah.'),
            landingFeature(Icons.lightbulb, 'Usulan Warga', 'Warga dapat mengirim usulan kebutuhan desa langsung dari dashboard.'),
          ],
        ),
      ),
    );
  }
}

class WargaHome extends StatefulWidget {
  final ApiService api;
  final AppUser user;
  final VoidCallback onLogout;

  const WargaHome({super.key, required this.api, required this.user, required this.onLogout});

  @override
  State<WargaHome> createState() => _WargaHomeState();
}

class _WargaHomeState extends State<WargaHome> {
  int tab = 0;
  bool loading = false;
  Map<String, dynamic>? laporan;
  List<dynamic> iuran = [];
  List<dynamic> pembayaran = [];
  List<dynamic> usulan = [];
  final judulUsulan = TextEditingController();
  final deskripsiUsulan = TextEditingController();

  @override
  void initState() {
    super.initState();
    loadAll();
  }

  Future<void> loadAll() async {
    setState(() => loading = true);
    try {
      final results = await Future.wait([
        widget.api.getLaporanWarga(),
        widget.api.getWargaIuran(),
        widget.api.getWargaPembayaran(),
        widget.api.getUsulanWarga(),
      ]);
      laporan = (results[0] as Map<String, dynamic>)['data'];
      iuran = results[1] as List<dynamic>;
      pembayaran = results[2] as List<dynamic>;
      usulan = results[3] as List<dynamic>;
    } catch (e) {
      if (mounted) showSnack(context, e.toString().replaceFirst('Exception: ', ''), error: true);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> bayar(dynamic item) async {
    try {
      final response = await widget.api.createQrisPayment(item['id']);
      final data = response['data'] ?? {};
      final redirect = data['redirect_url'];
      final orderId = data['order_id'];
      if (redirect != null) {
        await launchUrl(Uri.parse(redirect), mode: LaunchMode.externalApplication);
      }
      if (orderId != null) await widget.api.syncPayment(orderId);
      await loadAll();
    } catch (e) {
      if (mounted) showSnack(context, e.toString().replaceFirst('Exception: ', ''), error: true);
    }
  }

  Future<void> kirimUsulan() async {
    try {
      await widget.api.createUsulan({'judul': judulUsulan.text, 'deskripsi': deskripsiUsulan.text});
      judulUsulan.clear();
      deskripsiUsulan.clear();
      await loadAll();
      if (mounted) showSnack(context, 'Usulan berhasil dikirim');
    } catch (e) {
      if (mounted) showSnack(context, e.toString().replaceFirst('Exception: ', ''), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pages = [laporanPage(), iuranPage(), usulanPage()];
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard Warga'), actions: [IconButton(onPressed: widget.onLogout, icon: const Icon(Icons.logout))]),
      body: RefreshIndicator(
        onRefresh: loadAll,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          LogoHeader(title: widget.user.nama, subtitle: widget.user.email),
          const SizedBox(height: 12),
          if (loading) const LinearProgressIndicator(),
          const SizedBox(height: 12),
          pages[tab],
        ]),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: tab,
        onDestinationSelected: (v) => setState(() => tab = v),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.bar_chart), label: 'Laporan'),
          NavigationDestination(icon: Icon(Icons.qr_code), label: 'Iuran'),
          NavigationDestination(icon: Icon(Icons.lightbulb), label: 'Usulan'),
        ],
      ),
    );
  }

  Widget laporanPage() {
    final ringkasan = laporan?['ringkasan'] as Map<String, dynamic>? ?? {};

    return AppCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Laporan Keuangan', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
        const SizedBox(height: 12),
        metric('Total Pemasukan', ringkasan['total_pemasukan']),
        metric('Total Pengeluaran', ringkasan['total_pengeluaran']),
        metric('Saldo', ringkasan['saldo']),
      ]),
    );
  }

  Widget iuranPage() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Expanded(child: Text('Bayar Iuran', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900))),
            IconButton.filledTonal(onPressed: loading ? null : loadAll, icon: const Icon(Icons.refresh), tooltip: 'Refresh'),
          ],
        ),
        const SizedBox(height: 8),
        if (iuran.isEmpty)
          const AppCard(child: Text('Belum ada data iuran.', style: TextStyle(color: Colors.black54)))
        else
          ...iuran.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(color: const Color(0xffeff6ff), borderRadius: BorderRadius.circular(14)),
                            child: Icon(Icons.receipt_long, color: Theme.of(context).colorScheme.primary),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item['nama_iuran'] ?? '-', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17)),
                                if ((item['keterangan'] ?? '').toString().isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  Text(item['keterangan'], style: const TextStyle(color: Colors.black54, height: 1.35)),
                                ],
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(color: const Color(0xfff8fafc), borderRadius: BorderRadius.circular(16)),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Jumlah', style: TextStyle(color: Colors.black54, fontWeight: FontWeight.w700)),
                            Text(rupiah(item['jumlah']), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed: loading ? null : () => bayar(item),
                          icon: const Icon(Icons.qr_code_2),
                          label: const Text('Bayar QRIS'),
                          style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(48)),
                        ),
                      ),
                    ],
                  ),
                ),
              )),
        const SizedBox(height: 6),
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Riwayat Pembayaran', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
              const SizedBox(height: 12),
              if (pembayaran.isEmpty)
                const Text('Belum ada riwayat pembayaran.', style: TextStyle(color: Colors.black54))
              else
                ...pembayaran.map((p) => Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: const Color(0xfff8fafc), borderRadius: BorderRadius.circular(16)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(child: Text(p['nama_iuran'] ?? '-', style: const TextStyle(fontWeight: FontWeight.w900))),
                              const SizedBox(width: 8),
                              paymentStatusChip(p['status']),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text('${rupiah(p['jumlah_bayar'])} • ${dateText(p['tanggal_bayar'])}', style: const TextStyle(color: Colors.black54)),
                          if (p['bukti_transfer'] != null) ...[
                            const SizedBox(height: 6),
                            Text('Order ID: ${p['bukti_transfer']}', style: const TextStyle(color: Colors.black45, fontSize: 12), overflow: TextOverflow.ellipsis),
                          ],
                          if (p['status'] == 'pending' && p['bukti_transfer'] != null) ...[
                            const SizedBox(height: 10),
                            Align(
                              alignment: Alignment.centerRight,
                              child: OutlinedButton.icon(
                                onPressed: loading
                                    ? null
                                    : () async {
                                        await widget.api.syncPayment(p['bukti_transfer']);
                                        await loadAll();
                                      },
                                icon: const Icon(Icons.sync, size: 18),
                                label: const Text('Cek Status'),
                              ),
                            ),
                          ],
                        ],
                      ),
                    )),
            ],
          ),
        ),
      ],
    );
  }

  Widget usulanPage() {
    return Column(children: [
      AppCard(child: Column(children: [
        TextField(controller: judulUsulan, decoration: const InputDecoration(labelText: 'Judul usulan')),
        const SizedBox(height: 12),
        TextField(controller: deskripsiUsulan, decoration: const InputDecoration(labelText: 'Deskripsi'), minLines: 3, maxLines: 5),
        const SizedBox(height: 12),
        FilledButton(onPressed: kirimUsulan, child: const Text('Kirim Usulan')),
      ])),
      ...usulan.map((u) => AppCard(child: ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(u['judul'] ?? '-'),
            subtitle: Text('${u['deskripsi'] ?? ''}\nStatus: ${u['status'] ?? '-'}\nTanggapan: ${u['tanggapan_admin'] ?? '-'}'),
          ))),
    ]);
  }
}

class AdminHome extends StatefulWidget {
  final ApiService api;
  final AppUser user;
  final VoidCallback onLogout;

  const AdminHome({super.key, required this.api, required this.user, required this.onLogout});

  @override
  State<AdminHome> createState() => _AdminHomeState();
}

class _AdminHomeState extends State<AdminHome> {
  int tab = 0;
  bool loading = false;
  Map<String, dynamic>? laporan;
  List<dynamic> iuran = [];
  List<dynamic> usulan = [];
  final namaIuran = TextEditingController();
  final jumlahIuran = TextEditingController();
  final ketIuran = TextEditingController();
  int? editingIuranId;

  @override
  void initState() {
    super.initState();
    loadAll();
  }

  Future<void> loadAll() async {
    setState(() => loading = true);
    try {
      final results = await Future.wait([widget.api.getLaporanAdmin(), widget.api.getAdminIuran(), widget.api.getAdminUsulan()]);
      laporan = (results[0] as Map<String, dynamic>)['data'];
      iuran = results[1] as List<dynamic>;
      usulan = results[2] as List<dynamic>;
    } catch (e) {
      if (mounted) showSnack(context, e.toString().replaceFirst('Exception: ', ''), error: true);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> simpanIuran() async {
    try {
      final payload = {'nama_iuran': namaIuran.text, 'jumlah': jumlahIuran.text, 'keterangan': ketIuran.text};
      if (editingIuranId == null) {
        await widget.api.createAdminIuran(payload);
      } else {
        await widget.api.updateAdminIuran(editingIuranId!, payload);
      }
      namaIuran.clear();
      jumlahIuran.clear();
      ketIuran.clear();
      editingIuranId = null;
      await loadAll();
    } catch (e) {
      if (mounted) showSnack(context, e.toString().replaceFirst('Exception: ', ''), error: true);
    }
  }

  Future<void> updateUsulan(dynamic item, String status) async {
    try {
      await widget.api.updateAdminUsulan(item['id'], {'status': status, 'tanggapan_admin': item['tanggapan_admin'] ?? ''});
      await loadAll();
    } catch (e) {
      if (mounted) showSnack(context, e.toString().replaceFirst('Exception: ', ''), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pages = [laporanPage(), iuranPage(), usulanPage()];
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard Admin'), actions: [IconButton(onPressed: widget.onLogout, icon: const Icon(Icons.logout))]),
      body: RefreshIndicator(
        onRefresh: loadAll,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          LogoHeader(title: widget.user.nama, subtitle: widget.user.email),
          const SizedBox(height: 12),
          if (loading) const LinearProgressIndicator(),
          const SizedBox(height: 12),
          pages[tab],
        ]),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: tab,
        onDestinationSelected: (v) => setState(() => tab = v),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.bar_chart), label: 'Laporan'),
          NavigationDestination(icon: Icon(Icons.payments), label: 'Iuran'),
          NavigationDestination(icon: Icon(Icons.fact_check), label: 'Usulan'),
        ],
      ),
    );
  }

  Widget laporanPage() {
    final ringkasan = laporan?['ringkasan'] as Map<String, dynamic>? ?? {};

    return AppCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('Laporan Keuangan', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
      const SizedBox(height: 12),
      metric('Total Pemasukan', ringkasan['total_pemasukan']),
      metric('Total Pengeluaran', ringkasan['total_pengeluaran']),
      metric('Saldo', ringkasan['saldo']),
    ]));
  }

  Widget iuranPage() => Column(children: [
        AppCard(child: Column(children: [
          TextField(controller: namaIuran, decoration: const InputDecoration(labelText: 'Nama iuran')),
          const SizedBox(height: 12),
          TextField(controller: jumlahIuran, decoration: const InputDecoration(labelText: 'Jumlah'), keyboardType: TextInputType.number),
          const SizedBox(height: 12),
          TextField(controller: ketIuran, decoration: const InputDecoration(labelText: 'Keterangan')),
          const SizedBox(height: 12),
          FilledButton(onPressed: simpanIuran, child: Text(editingIuranId == null ? 'Tambah Iuran' : 'Update Iuran')),
        ])),
        ...iuran.map((item) => AppCard(child: ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(item['nama_iuran'] ?? '-'),
              subtitle: Text('${rupiah(item['jumlah'])}\n${item['keterangan'] ?? ''}'),
              trailing: Wrap(children: [
                IconButton(onPressed: () { setState(() { editingIuranId = item['id']; namaIuran.text = item['nama_iuran'] ?? ''; jumlahIuran.text = '${item['jumlah'] ?? ''}'; ketIuran.text = item['keterangan'] ?? ''; }); }, icon: const Icon(Icons.edit)),
                IconButton(onPressed: () async { await widget.api.deleteAdminIuran(item['id']); await loadAll(); }, icon: const Icon(Icons.delete), color: Colors.red),
              ]),
            ))),
      ]);

  Widget usulanPage() => Column(children: [
        ...usulan.map((item) => AppCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(item['judul'] ?? '-', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
              Text('Warga: ${item['warga_nama'] ?? '-'}'),
              const SizedBox(height: 6),
              Text(item['deskripsi'] ?? ''),
              const SizedBox(height: 8),
              Text('Status: ${item['status'] ?? '-'}', style: const TextStyle(fontWeight: FontWeight.bold)),
              Wrap(spacing: 8, children: [
                OutlinedButton(onPressed: () => updateUsulan(item, 'diproses'), child: const Text('Diproses')),
                OutlinedButton(onPressed: () => updateUsulan(item, 'diterima'), child: const Text('Terima')),
                OutlinedButton(onPressed: () => updateUsulan(item, 'ditolak'), child: const Text('Tolak')),
              ]),
            ]))),
      ]);
}

Widget metric(String label, dynamic value) {
  return Container(
    width: double.infinity,
    margin: const EdgeInsets.only(bottom: 10),
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: const Color(0xfff1f5f9), borderRadius: BorderRadius.circular(16)),
    child: Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [Text(label, style: const TextStyle(fontWeight: FontWeight.bold)), Text(rupiah(value), style: const TextStyle(fontWeight: FontWeight.w900))],
    ),
  );
}

String rupiah(dynamic value) {
  final n = num.tryParse('$value') ?? 0;
  final s = n.toStringAsFixed(0).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (m) => '.');
  return 'Rp$s';
}

String dateText(dynamic value) {
  if (value == null || '$value'.isEmpty) return '-';
  return '$value'.length >= 10 ? '$value'.substring(0, 10) : '$value';
}

Widget paymentStatusChip(dynamic status) {
  final text = '${status ?? '-'}';
  Color background;
  Color foreground;

  switch (text) {
    case 'diterima':
      background = const Color(0xffdcfce7);
      foreground = const Color(0xff15803d);
      break;
    case 'ditolak':
      background = const Color(0xfffee2e2);
      foreground = const Color(0xffb91c1c);
      break;
    case 'verifikasi':
      background = const Color(0xffe0e7ff);
      foreground = const Color(0xff3730a3);
      break;
    default:
      background = const Color(0xfffef3c7);
      foreground = const Color(0xff92400e);
  }

  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
    decoration: BoxDecoration(color: background, borderRadius: BorderRadius.circular(999)),
    child: Text(text, style: TextStyle(color: foreground, fontWeight: FontWeight.w900, fontSize: 12)),
  );
}

void showSnack(BuildContext context, String message, {bool error = false}) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message), backgroundColor: error ? Colors.red : Colors.green));
}
