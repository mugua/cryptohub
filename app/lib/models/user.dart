class User {
  final String id;
  final String email;
  final String username;
  final String language;
  final String theme;
  final String? avatar;

  const User({
    required this.id,
    required this.email,
    required this.username,
    this.language = 'zh-CN',
    this.theme = 'dark',
    this.avatar,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      username: json['username'] as String,
      language: json['language'] as String? ?? 'zh-CN',
      theme: json['theme'] as String? ?? 'dark',
      avatar: json['avatar'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'username': username,
      'language': language,
      'theme': theme,
      'avatar': avatar,
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? username,
    String? language,
    String? theme,
    String? avatar,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      username: username ?? this.username,
      language: language ?? this.language,
      theme: theme ?? this.theme,
      avatar: avatar ?? this.avatar,
    );
  }
}
